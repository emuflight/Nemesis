const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const server = require("./server/express.js");

// const { autoUpdater } = require("electron-updater");
require("electron-context-menu")({
  prepend: (params, browserWindow) => [
    {
      label: "Rainbow",
      // Only show it when right-clicking images
      visible: params.mediaType === "image"
    }
  ]
});

let mainWindow;

server.app.use(server.express.static(path.join(__dirname, "/")));

function createWindow() {
  mainWindow = new BrowserWindow({
    titleBarStyle: "hidden",
    width: 1281,
    height: 800,
    minWidth: 1281,
    minHeight: 800,
    backgroundColor: "#303030",
    icon: path.join(__dirname, "../build/android-chrome-192x192.png"),
    webPreferences: {
      webSecurity: false
    },
    node: {
      __dirname: false
    }
  });
  let isProd = __dirname.indexOf("app.asar") > -1;
  let port = isProd ? 9001 : 3000;
  mainWindow.loadURL(`http://localhost:${port}/`); // load the react app
  mainWindow.on("closed", () => (mainWindow = null));
  return isProd || mainWindow.webContents.openDevTools();
}

function createMenu() {
  const application = {
    label: "Application",
    submenu: [
      {
        label: "About Application",
        selector: "orderFrontStandardAboutPanel:"
      },
      {
        type: "separator"
      },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: () => {
          app.quit();
        }
      }
    ]
  };

  const edit = {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        selector: "undo:"
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:"
      },
      {
        type: "separator"
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        selector: "cut:"
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        selector: "copy:"
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        selector: "paste:"
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:"
      }
    ]
  };

  const template = [application, edit];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
// when the app is loaded create a BrowserWindow and check for updates
app.on("ready", function() {
  createWindow();
  createMenu();
  // if (!isDev) autoUpdater.checkForUpdates();
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

process.on("uncaughtException", function(error) {
  process.stdout.write(error);
  // Handle the error
});

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
// autoUpdater.on("update-downloaded", info => {
//   mainWindow.webContents.send("updateReady");
// });

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
  // autoUpdater.quitAndInstall();
});
