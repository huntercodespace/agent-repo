const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("piDesktop", {
  minimize: () => ipcRenderer.send("window:minimize"),
  toggleMaximize: () => ipcRenderer.send("window:toggle-maximize"),
  close: () => ipcRenderer.send("window:close"),
  getEngineStatus: () => ipcRenderer.invoke("rpc:get-status"),
  sendPrompt: (message) => ipcRenderer.invoke("rpc:prompt", message),
  onEngineStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("rpc:status", listener);
    return () => ipcRenderer.removeListener("rpc:status", listener);
  },
  onRpcEvent: (callback) => {
    const listener = (_event, event) => callback(event);
    ipcRenderer.on("rpc:event", listener);
    return () => ipcRenderer.removeListener("rpc:event", listener);
  },
});
