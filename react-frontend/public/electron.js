// Electron desktop application
// import { QASM } from "../src/QASM/QASM.js";
const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");
const QASM = require("../src/QASM/QASM.js");
var QASM_test = new QASM();

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule:true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog();
    if (canceled) {
        return;
    } else {
        return filePaths[0];
    }
}

async function handleLoadLabels() {
    // return QASM_test.readConfig();
    let file_path = await handleFileOpen();
    return JSON.parse(fs.readFileSync(file_path));
    // return JSON.parse(fs.readFileSync("./config.json"));
    // return __dirname;
}

async function handleSaveLabels(labels) {
  let file_path = await handleFileOpen();
  fs.writeFileSync(file_path, JSON.stringify(labels));
  return "Saved";
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen);
    ipcMain.handle("loadLabels", handleLoadLabels);
    ipcMain.handle("saveLabels", (event, labels) => {
      return handleSaveLabels(labels);
    });
    createWindow();    
});

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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

