// Electron desktop application
const path = require("path");
const electron_utils = require("./electron_utils.js");
const { app, BrowserWindow, dialog } = require("electron");
const isDev = require("electron-is-dev");
const s3_protocol = "s3" // followed by '://', e.g. 's3://'

// https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(s3_protocol, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(s3_protocol)
}

const gotTheLock = app.requestSingleInstanceLock()
let mainWindow

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    
    dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop().slice(0, -1)}`)
  })
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule:true,
      webSecurity: false, // allows loading local files
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

// Start app once electron has initialized
app.whenReady().then(() => {
    electron_utils.init_ipc_handlers();
    createWindow();    
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

