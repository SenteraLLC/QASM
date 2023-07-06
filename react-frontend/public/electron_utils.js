// Utils for electron
const { ipcMain, dialog } = require("electron");
const { image_types, function_names } = require("./electron_constants.js");
const fs = require("fs");
const path = require('path');


// Connect function names with their function handlers
exports.function_handlers = {
    // [function_names.SAVE_BINARY_DIRECTORY]:      saveBinaryDirectory,
    [function_names.LOAD_LABELS_DIALOG]:         handleLoadLabels,
    // [function_names.LOAD_IMAGE_DIALOG]:          handleLoadImage,
    [function_names.LOAD_IMAGES_DIALOG]:         handleLoadImages,
    [function_names.OPEN_DIR_DIALOG]:            handleOpenDir,
    // [function_names.OPEN_IMG_DIR_DIALOG]:        handleOpenImgDir,
    // [function_names.OPEN_IMG_DIALOG]:            handleLoadImage,
    // [function_names.SAVE_IMAGE_DIALOG]:          handleSaveImage,
    [function_names.LOAD_JSON]:                  handleLoadJson,
    [function_names.SAVE_JSON_DIALOG]:           handleSaveJSON,
    [function_names.SAVE_JSON]:                  handleSaveJSONtoPath,
    // [function_names.OPEN_FOLDER]:                handleOpenS3Folder,
    // [function_names.GET_CASCADING_DIR_CHILDREN]: getS3FolderChildren,
}


// TODO: update functionality to start in the current directory

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
 * @param event event
 * @param {object} data {path: <string>, loadnames: Array<string>}
 * @returns file path on sucess, nothing on cancel
 */
async function handleOpenFile(event, data) {
    const dialogOptions = {
        title: "Select File",
        filters: [
            { name: "json (required)", extensions: ["json"] },
            { name: "Any type", extensions: ["*"]},
        ],
    }
    if ("path" in data && "loadnames" in data) {
        // check if any of the loadnames exist in the path
        let loadnames = data["loadnames"];
        let path = data["path"];
        let files = fs.readdirSync(path);
        for (let loadname of loadnames) {
            if (files.includes(loadname)) {
                path += "\\" + loadname;
                break;
            }
        }
        dialogOptions["defaultPath"] = path;
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
 * @param event event
 * @param {object} data {labels: <Object>, path: <string>}
 * @returns file path on sucess, nothing on cancel
 */
 async function handleSaveJSON(event, data) {
    const dialogOptions = {
        title: "Select Where to Save Labels",
        filters: [
            { name: "json (required)", extensions: ["json"] },
        ],
    }
    const { canceled, filePath } = await dialog.showSaveDialog(dialogOptions);
    if (canceled) {
        return "Canceled saving labels.";
    } else {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data.labels));
            return "Saved labels at " + filePath;
        } catch {
            return "Error when saving labels.";
        }
    }
}

/**
 * Save a json to a path
 * 
 * @param event event
 * @param {object} data {labels: <Object>, path: <string>}
 * @returns file path on sucess, nothing on cancel
 */
 async function handleSaveJSONtoPath(event, data) {
    try {
        fs.writeFileSync(data.path, JSON.stringify(data.labels));
        return "Saved labels at " + data.path;
    } catch (e) {
        return "Error when saving labels.";
    }
}


/**
 * Open a directory selection dialog
 * 
 * @param {*} event event
 * @param {Object} data data
 * @returns dir path on sucess, nothing on cancel
 */
 async function handleOpenDir(event, data) {
    const dialogOptions = {
        title: "Select Image Directory",
        properties: ["openDirectory"]
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled) {
        return;
    } else {
        return filePaths[0];
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
        let file_path = await handleOpenFile(event, data);
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
            let file_key = file.substring(0, file.indexOf('.')); // remove ext from name
            if (ext in image_types) {
                images[file_key] = "file://" + path.join(file_path, file).replaceAll("\\","/");
            }
        })
        return images;
    } catch {
        return {};
    }
}

/**
 * Get annotation json from a file path
 * 
 * @param {*} event event
 * @param {string} data file path
 * @returns {Object} annotation json
 */
 async function handleLoadJson(event, data) {
    let rawdata = fs.readFileSync(data);
    return JSON.parse(rawdata);
}