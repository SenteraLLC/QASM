// Utils for electron
const { ipcMain, dialog } = require("electron");
const { image_types, function_names } = require("./electron_constants.js");
const fs = require("fs");
const path = require('path');

// Connect function names with their function handlers
exports.function_handlers = {
    [function_names.SAVE_LABELS]:  handleSaveLabels,
    [function_names.OPEN_FILE]:    handleOpenFile,
    [function_names.LOAD_LABELS]:  handleLoadLabels,
    [function_names.OPEN_DIR]:     handleOpenDir,
    [function_names.LOAD_IMAGES]:  handleLoadImages,
    [function_names.SAVE_FILE]:    handleSaveFile,
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
    const dialogOptions = {
        filters: [
            { name: "json (required)", extensions: ["json"] },
            { name: "Any type", extensions: ["*"]},
        ],
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled) {
        return;
    } else {
        return filePaths[0];
    }
}

/**
 * Open a save file dialog
 * 
 * @returns file path on sucess, nothing on cancel
 */
 async function handleSaveFile(event, data) {
    const dialogOptions = {
        filters: [
            { name: "json (required)", extensions: ["json"] },
        ],
    }
    const { canceled, filePath } = await dialog.showSaveDialog(dialogOptions);
    if (canceled) {
        return "Canceled saving labels.";
    } else {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data));
            return "Saved labels at " + filePath;
        } catch {
            return "Error when saving labels.";
        }
    }
}

/**
 * Open a directory selection dialog
 * 
 * @returns dir path on sucess, nothing on cancel
 */
 async function handleOpenDir(event, data) {
    const dialogOptions = {
        filters: [
            { name: "Select Image Directory", extensions: ["*"]},
        ],
        properties: ['openDirectory']
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
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

/**
 * Load images from a folder as base64 strings
 * 
 * @param {*} event event
 * @param {string} data file path
 * @returns {Object} image base64 strings indexed by image name
 */
 async function handleLoadImages(event, data) {
    try {
        let file_path = data;
        let files = fs.readdirSync(file_path);
        let images = {};
        files.forEach(file => {
            let ext = path.extname(file).slice(1);
            if (ext in image_types) {
                images[file] = "data:image/" + ext + ";base64," + fs.readFileSync(path.join(file_path, file), "base64");;
            }
        })
        return images;
    } catch {
        return {};
    }
}