const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
require("../src/server/express.js");

const { autoUpdater } = require("electron-updater");

require("electron-context-menu")({
  prepend: (params, browserWindow) => [
    {
      label: "Rainbow",
      // Only show it when right-clicking images
      visible: params.mediaType === "image"
    }
  ]
});

require("electron-dl")();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1280, height: 1024 });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  ); // load the react app
  mainWindow.on("closed", () => (mainWindow = null));
}

// when the app is loaded create a BrowserWindow and check for updates
app.on("ready", function() {
  createWindow();
  if (!isDev) autoUpdater.checkForUpdates();
});

// on MacOS leave process running also with no windows
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// if there are no windows create one
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on("update-downloaded", info => {
  mainWindow.webContents.send("updateReady");
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
  autoUpdater.quitAndInstall();
});
