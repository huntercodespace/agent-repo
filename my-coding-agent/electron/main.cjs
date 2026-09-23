const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
const fs = require("fs");
const path = require("path");

const isDev = process.env.ELECTRON_DEV === "1";

if (process.env.ELECTRON_NO_SANDBOX === "1") {
  app.commandLine.appendSwitch("no-sandbox");
  app.commandLine.appendSwitch("disable-dev-shm-usage");
}

/** @type {Map<number, { start: () => Promise<void>, stop: () => Promise<void>, prompt: (message: string) => Promise<unknown>, snapshot: () => unknown, isStopping: () => boolean }>} */
const sessions = new Map();

const hostPromise = import("./rpc-host.mjs");
const credentialsPromise = import("./credentials.mjs");

function broadcast(channel, payload) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isDestroyed() || win.webContents.isDestroyed()) continue;
    try {
      win.webContents.send(channel, payload);
    } catch {
      // The frame can close between the destroyed check and send.
    }
  }
}

async function publishCredentials() {
  const credentials = await credentialsPromise;
  const providers = await credentials.getStatus();
  const summary = credentials.summaryFrom(providers);
  for (const session of sessions.values()) {
    session.setCredentials?.(summary);
  }
  broadcast("credentials:status", { summary, providers });
  return { summary, providers };
}

function windowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    backgroundColor: "#0b0e13",
    title: "Pi",
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../public/pi-logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      // Chromium’s sandbox cannot start in some Linux containers. The same
      // ELECTRON_NO_SANDBOX=1 switch documented for the browser process also
      // has to turn off the renderer sandbox or the preload bridge never loads.
      sandbox: process.env.ELECTRON_NO_SANDBOX !== "1",
    },
  });

  Menu.setApplicationMenu(null);

  const webContentsId = win.webContents.id;

  win.on("close", (event) => {
    const session = sessions.get(webContentsId);
    if (!session || session.isStopping()) return;
    event.preventDefault();
    session.stop().finally(() => {
      sessions.delete(webContentsId);
      if (!win.isDestroyed()) win.destroy();
    });
  });

  const load = () => {
    if (win.isDestroyed() || win.__piLoaded) return;
    win.__piLoaded = true;
    if (isDev) {
      win.loadURL("http://127.0.0.1:5173");
      return;
    }
    const indexPath = path.join(__dirname, "../dist/index.html");
    if (!fs.existsSync(indexPath)) {
      win.loadURL(
        "data:text/html;charset=utf-8," +
          encodeURIComponent(
            "<body style='background:#101418;color:#e1e2e9;font-family:sans-serif;padding:24px'>Renderer build not found. Run <code>npm start</code> or <code>npm run dev</code>.</body>",
          ),
      );
      return;
    }
    win.loadFile(indexPath);
  };

  hostPromise
    .then((host) => {
      if (win.isDestroyed()) return null;
      const project = host.resolveProjectCwd();
      const session = host.createWindowSession({
        webContentsId,
        cwd: project.cwd,
        cwdWarning: project.warning,
        send(channel, payload) {
          try {
            if (win.isDestroyed() || win.webContents.isDestroyed()) return;
            win.webContents.send(channel, payload);
          } catch {
            // The first frame can be disposed while Chromium is still starting.
          }
        },
      });
      sessions.set(webContentsId, session);
      win.webContents.on("did-finish-load", () => {
        if (win.isDestroyed()) return;
        win.webContents.send("rpc:status", session.snapshot());
      });
      const starting = session.start();
      load();
      return starting;
    })
    .catch((error) => {
      console.error("[pi-rpc] failed to start session", error instanceof Error ? error.message : error);
      load();
    });
}

ipcMain.on("window:minimize", (event) => windowFromEvent(event)?.minimize());
ipcMain.on("window:toggle-maximize", (event) => {
  const win = windowFromEvent(event);
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});
ipcMain.on("window:close", (event) => windowFromEvent(event)?.close());

ipcMain.handle("rpc:get-status", async (event) => {
  const session = sessions.get(event.sender.id);
  if (session) return session.snapshot();
  const host = await hostPromise;
  const project = host.resolveProjectCwd();
  return host.disconnectedSnapshot(event.sender.id, project.cwd);
});

ipcMain.handle("rpc:prompt", async (event, message) => {
  const session = sessions.get(event.sender.id);
  if (!session) return { ok: false, code: "disconnected", message: "这个窗口没有 RPC 会话" };
  return session.prompt(message);
});

ipcMain.handle("credentials:listProviders", async () => {
  const credentials = await credentialsPromise;
  return credentials.listProviders();
});

ipcMain.handle("credentials:getStatus", async () => {
  const credentials = await credentialsPromise;
  return credentials.getStatus();
});

ipcMain.handle("credentials:saveApiKey", async (event, payload) => {
  const credentials = await credentialsPromise;
  const result = await credentials.saveApiKey(payload?.providerId, payload?.apiKey);
  if (result?.status === "error") return result;
  await publishCredentials();
  const session = sessions.get(event.sender.id);
  const applied = await credentials.afterApiKeySaved(result.providerId, session);
  if (applied?.ok) {
    broadcast("models:selected", {
      providerId: applied.providerId,
      modelId: applied.modelId,
      name: applied.name,
      live: applied.live,
    });
  }
  return result;
});

ipcMain.handle("credentials:clear", async (_event, payload) => {
  const credentials = await credentialsPromise;
  const result = await credentials.clearCredential(payload?.providerId);
  await publishCredentials();
  return result;
});

ipcMain.handle("credentials:startOAuth", async (_event, payload) => {
  const credentials = await credentialsPromise;
  const result = await credentials.startOAuth(payload?.providerId);
  if (result?.status !== "error") await publishCredentials();
  return result;
});

ipcMain.handle("credentials:logoutOAuth", async (_event, payload) => {
  const credentials = await credentialsPromise;
  const result = await credentials.logoutOAuth(payload?.providerId);
  await publishCredentials();
  return result;
});

ipcMain.handle("credentials:detectEnv", async (_event, payload) => {
  const credentials = await credentialsPromise;
  const detected = await credentials.detectEnv(payload?.providerId);
  await publishCredentials();
  return detected;
});

ipcMain.handle("models:get", async () => {
  const credentials = await credentialsPromise;
  return credentials.getSelectedModel();
});

ipcMain.handle("models:set", async (event, payload) => {
  const credentials = await credentialsPromise;
  const saved = await credentials.setSelectedModel(payload?.providerId, payload?.modelId);
  if (!saved.ok) return saved;
  const session = sessions.get(event.sender.id);
  let live = null;
  if (session?.setModel) {
    try {
      live = await session.setModel(saved.providerId, saved.modelId);
    } catch (error) {
      live = {
        ok: false,
        message: error instanceof Error ? error.message : "模型切换失败",
      };
    }
  }
  broadcast("models:selected", {
    providerId: saved.providerId,
    modelId: saved.modelId,
    name: saved.name,
    live,
  });
  return { ...saved, live };
});

credentialsPromise.then((credentials) => {
  credentials.setBrowserOpener((url) => shell.openExternal(url));
  credentials.setOAuthEmitter((event) => broadcast("credentials:oauth-event", event));
});

let quitting = false;
app.on("before-quit", (event) => {
  if (quitting) return;
  const pending = [...sessions.values()].filter((session) => !session.isStopping());
  if (pending.length === 0) return;
  event.preventDefault();
  quitting = true;
  Promise.all(pending.map((session) => session.stop())).finally(() => {
    sessions.clear();
    app.quit();
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
