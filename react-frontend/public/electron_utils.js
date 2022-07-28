// Utils for electron
const { ipcMain, dialog } = require("electron");
const { function_names } = require("./electron_constants.js");
const fs = require("fs");

// Connect function names with their function handlers
exports.function_handlers = {
    [function_names.SAVE_LABELS]:  handleSaveLabels,
    [function_names.OPEN_FILE]:    handleOpenFile,
    [function_names.LOAD_LABELS]:  handleLoadLabels,
}

/**
 * Initialize all ipc handlers listed in electron_utils.js
 * 
 * @param ipcMain ipcMain from electron module
 */
exports.init_ipc_handlers = () => {
    // Create handlers for each function listed above 
    let keys = Object.values(function_names);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        ipcMain.handle(key, (event, data) => {
            return this.function_handlers[key](event, data);
        });
    }
}


/**
 * Open a file selection dialog
 * 
 * @returns file path on sucess, nothing on cancel
 */
async function handleOpenFile(event, data) {
    const { canceled, filePaths } = await dialog.showOpenDialog();
    if (canceled) {
        return;
    } else {
        return filePaths[0];
    }
}


/**
 * Prompt the user to select a save destination,
 * and then save the labels.
 * 
 * @param {*} event event
 * @param {Object} data object with all the labels
 * @returns {string} result
 */
async function handleSaveLabels(event, data) {
    // data is our object with all the labels
    try {
        let file_path = await handleOpenFile();
        fs.writeFileSync(file_path, JSON.stringify(data));
        return "Saved labels at " + file_path;
    } catch {
        return "Error when saving labels.";
    }
    
}

/**
 * Prompt the user to select a file,
 * and then load and return the labels.
 * 
 * @param {*} event event
 * @param {Object} data data
 * @returns {Object} labels
 */
async function handleLoadLabels(event, data) {
    try {
        let file_path = await handleOpenFile();
        let labels = JSON.parse(fs.readFileSync(file_path));
        return labels;
    } catch {
        return {};
    }
}
