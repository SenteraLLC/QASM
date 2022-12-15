// Electron desktop application
const path = require("path");
const electron_utils = require("./electron_utils.js");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
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
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(process.cwd(), "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
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

