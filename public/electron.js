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
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    backgroundColor: "#303030",
    icon: path.join(__dirname, "assets/icons/png/64x64.png"),
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false,
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
  // autoUpdater.checkForUpdates();
});

// on MacOS leave process running also with no windows
app.on("window-all-closed", () => {
  app.quit();
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

// // when the update has been downloaded and is ready to be installed, notify the BrowserWindow
// autoUpdater.on("update-downloaded", info => {
//   mainWindow.webContents.send("updateReady");
// });

// autoUpdater.on("checking-for-update", () => {
//   mainWindow.webContents.send("Checking for update...");
// });
// autoUpdater.on("update-available", info => {
//   mainWindow.webContents.send("Update available.");
// });
// autoUpdater.on("update-not-available", info => {
//   mainWindow.webContents.send("Update not available.");
// });
// autoUpdater.on("error", err => {
//   mainWindow.webContents.send("Error in auto-updater. " + err);
// });
// autoUpdater.on("download-progress", progressObj => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + " - Downloaded " + progressObj.percent + "%";
//   log_message =
//     log_message +
//     " (" +
//     progressObj.transferred +
//     "/" +
//     progressObj.total +
//     ")";
//   mainWindow.webContents.send(log_message);
// });

// when receiving a quitAndInstall signal, quit and install the new version ;)
// ipcMain.on("quitAndInstall", (event, arg) => {
//   autoUpdater.quitAndInstall();
// });
