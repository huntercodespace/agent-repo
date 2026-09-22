const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const fs = require("fs");
const path = require("path");

const isDev = process.env.ELECTRON_DEV === "1";

if (process.env.ELECTRON_NO_SANDBOX === "1") {
  app.commandLine.appendSwitch("no-sandbox");
  app.commandLine.appendSwitch("disable-dev-shm-usage");
}

let mainWindow = null;

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
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow = win;

  if (isDev) {
    win.loadURL("http://127.0.0.1:5173");
  } else {
    const indexPath = path.join(__dirname, "../dist/index.html");
    if (!fs.existsSync(indexPath)) {
      win.loadURL(
        "data:text/html;charset=utf-8," +
          encodeURIComponent(
            "<body style='background:#101418;color:#e1e2e9;font-family:sans-serif;padding:24px'>Renderer build not found. Run <code>npm start</code> or <code>npm run dev</code>.</body>",
          ),
      );
    } else {
      win.loadFile(indexPath);
    }
  }

}

ipcMain.on("window:minimize", () => mainWindow?.minimize());
ipcMain.on("window:toggle-maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on("window:close", () => mainWindow?.close());

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
