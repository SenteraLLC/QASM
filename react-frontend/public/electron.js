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

function openDeepLink(mainWindow, deep_link) {
  // remove s3 and the '://'
  let s3_path = deep_link.slice(s3_protocol.length + "://".length); 
  // get the first part of the path, which is the bucket name
  let bucket_name = s3_path.split("/")[0];
  // get the rest of the path, which is the folder name
  let start_folder = s3_path.slice(bucket_name.length + 1);

  // open an s3 browser window
  mainWindow.webContents.executeJavaScript(`let popup = window.open(window.location.href, "S3 Browser"); popup.window.S3_BROWSER_MODE = "select_directory"; popup.window.START_FOLDER = decodeURI("${start_folder}"); popup.window.BUCKET_NAME = decodeURI("${bucket_name}");`)
}

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      // open the deep link in a new window using s3 browser
      let deep_link = commandLine.pop().slice(0, -1); // full url with s3:// prefix
      openDeepLink(mainWindow, deep_link);
    }
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

