const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron",{
  // Functions to expose to the window
  // openFile: () => ipcRenderer.invoke('dialog:openFile'),
  // loadLabels: () => ipcRenderer.invoke("loadLabels"),
  // saveLabels: (labels) => ipcRenderer.invoke("saveLabels", "cheese"),
  invoke: (channel, data) => {
      // whitelist channels
      let validChannels = [
        "saveLabels"
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
  },
})