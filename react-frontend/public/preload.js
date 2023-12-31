// Expose backend functions to the frontend via the window
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

// Adds jquery to Electron Isolated Context once window is ready
// window.onload = () => {
//   window.$ = window.jQuery = require('jquery');
// }