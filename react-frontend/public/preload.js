const { contextBridge, ipcRenderer } = require("electron");
const { function_names } = require("./electron_constants.js");

contextBridge.exposeInMainWorld("electron",{
  invoke: (channel, data) => {
      // whitelist channels in electron_utils.js
      let validChannels = Object.values(function_names);

      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      } else {
        console.log(channel + " not found. Add to function names in electron_utils.js.");
        console.log(validChannels);
      }
  },
})