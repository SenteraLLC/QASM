// Electron desktop application
const fs = require('fs')
const path = require("path");
const electron_utils = require("./electron_utils.js");
const { s3_browser_modes } = require("./electron_constants.js");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const s3_protocol = "s3" // followed by '://', e.g. 's3://'

function openDeepLink(mainWindow, deep_link) {
  // remove s3 and the '://'
  let s3_path = deep_link.slice(s3_protocol.length + "://".length); 
  // get the first part of the path, which is the bucket name
  let bucket_name = s3_path.split("/")[0];
  // get the rest of the path, which is the folder name
  let start_folder = s3_path.slice(bucket_name.length + 1);

  // open an s3 browser window
  mainWindow.webContents.executeJavaScript(`try{let popup}catch{}; popup = window.open(window.location.href, "S3 Browser"); popup.window.S3_BROWSER_MODE = "${s3_browser_modes.DEEP_LINK}"; popup.window.START_FOLDER = decodeURI("${start_folder}"); popup.window.BUCKET_NAME = decodeURI("${bucket_name}");`)
}

// Only intercept s3 protocol if specified in config
let config = JSON.parse(fs.readFileSync(path.resolve(__dirname,"./config-dup.json"), "utf-8"));
if ("intercept_s3_protocol" in config && config.intercept_s3_protocol) {
  // https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(s3_protocol, process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient(s3_protocol)
  }
} else {
  // remove as default protocol client
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.removeAsDefaultProtocolClient(s3_protocol, process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.removeAsDefaultProtocolClient(s3_protocol)
  }
}
  
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    let mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      // This handles opening a deep link when the app is already running
      let deep_link = commandLine.pop(); // full url with s3:// prefix
      openDeepLink(mainWindow, deep_link);
    }
  })
}

function createWindow() {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
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
  
  if (process.platform === 'win32') {
    // This handles opening a deep link when the app wasn't already running
    let deep_link;
    // process.argv will be a string or an array
    typeof(process.argv) === "string" ? deep_link = process.argv : deep_link = process.argv.pop();
    // ensure link starts with s3://
    if (typeof(deep_link) === "string" && deep_link.startsWith(s3_protocol)) {
      openDeepLink(mainWindow, deep_link);
    }
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

