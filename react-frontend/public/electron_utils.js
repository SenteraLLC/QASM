// Utils for electron
const { ipcMain, dialog } = require("electron");
const { image_types, function_names } = require("./electron_constants.js");
const fs = require("fs");
const path = require('path');


// Connect function names with their function handlers
exports.function_handlers = {
    // ##### DIRECTORY #####
    [function_names.OPEN_DIR_DIALOG]:       handleOpenDirDialog,
    [function_names.OPEN_IMAGE_DIR_DIALOG]: handleOpenImageDirDialog,
    [function_names.SAVE_BINARY_DIRECTORY]: saveBinaryDirectory,
    [function_names.GET_FOLDER_CONTENTS]:   handleGetFolderContents,
    // ##### IMAGE #####
    [function_names.LOAD_IMAGE_DIALOG]:     handleLoadImageDialog,
    [function_names.LOAD_IMAGES]:           handleLoadImages,
    [function_names.SAVE_IMAGE_DIALOG]:     handleSaveImageDialog,
    // ##### JSON #####
    [function_names.LOAD_JSON_DIALOG]:      handleLoadJsonDialog,
    [function_names.LOAD_JSON]:             handleLoadJson,
    [function_names.SAVE_JSON_DIALOG]:      handleSaveJsonDialog,
    [function_names.SAVE_JSON]:             handleSaveJson,
}


// ##### UTILS #####


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

        // Ensure loadnames is an array
        if (Array.isArray(loadnames)) {
            let files = fs.readdirSync(path);
            for (let loadname of loadnames) {
                if (files.includes(loadname)) {
                    path += "\\" + loadname;
                    dialogOptions["defaultPath"] = path;
                    break;
                }
            }
        } else {
            console.warn("loadnames is not an array, ignoring.");
        }
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled) {
        return;
    } else {
        return filePaths[0];
    }
}


// ##### DIRECTORY #####


/**
 * Open a directory selection dialog
 * 
 * @param {*} event event
 * @param {Object} data starting folder
 * @returns dir path on sucess, nothing on cancel
 */
async function handleOpenDirDialog(event, data) {
    const dialogOptions = {
        title: "Select Directory",
        properties: ["openDirectory"]
    }
    // Start at data if it exists
    if (data !== "" && data !== undefined) {
        dialogOptions["defaultPath"] = data;
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled) {
        return;
    } else {
        return filePaths[0];
    }
}


/**
 * Open a directory, ensuring that it contains images
 * TODO: implement
 * 
 * @param {*} event event
 * @param {Object} data data
 * @returns dir path on sucess, nothing on cancel
 */
async function handleOpenImageDirDialog(event, data) {
    console.warn("handleOpenImageDirDialog not implemented: falling back to handleOpenDirDialog");
    return handleOpenDirDialog(event, data);
}


/**
 * TODO: implement
 * 
 * @param {*} event event
 * @param {Object} data data
 */
async function saveBinaryDirectory(event, data) {
    console.error("saveBinaryDirectory not implemented.");
}


/**
 * Get the contents of a folder
 * 
 * @param {*} event event
 * @param {string} data folder path
 * @returns {Object} { folders: [], files: [] }
 */
async function handleGetFolderContents(event, data) {
    try {
        let file_path = data;
        let contents = fs.readdirSync(file_path);
        let files = [];
        let folders = [];
        contents.forEach(content => {
            // Check if file is a folder, if so add to folders and remove from files
            content = path.join(file_path, content)
            if (fs.lstatSync(content).isDirectory()) {
                folders.push(content);
            } else {
                files.push(content);
            }
        })
        return { folders: folders, files: files };
    } catch {
        return { folders: [], files: [] };
    }
}


// ##### IMAGE #####


/**
 * TODO: implement
 * 
 * @param {*} event event
 * @param {Object} data data
 */
async function handleLoadImageDialog(event, data) {
    console.error("handleLoadImageDialog not implemented.");
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
 * TODO: implement
 * 
 * @param {*} event event
 * @param {Object} data data
 */
async function handleSaveImageDialog(event, data) {
    console.error("handleSaveImageDialog not implemented.");
}


// ##### JSON #####


/**
 * Prompt the user to select a file,
 * and then load and return the labels.
 * 
 * @param {*} event event
 * @param {Object} data data
 * @returns {Object} labels
 */
async function handleLoadJsonDialog(event, data) {
    try {
        let file_path = await handleOpenFile(event, data);
        let labels = JSON.parse(fs.readFileSync(file_path));
        return labels;
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


/**
 * Open a save file dialog
 * 
 * @param event event
 * @param {object} data {labels: <Object>, path: <string>, savename: <string>}
 * @returns file path on sucess, nothing on cancel
 */
async function handleSaveJsonDialog(event, data) {
    const dialogOptions = {
        title: "Select Where to Save Labels",
        filters: [
            { name: "json (required)", extensions: ["json"] },
        ],
    }
    // Populate the default path
    if ("path" in data && "savename" in data) {
        // Ensure savename is a non-empty string
        if (typeof data["savename"] === "string" && data["savename"] !== "") {
            dialogOptions["defaultPath"] = path.join(data["path"], data["savename"]);
        }
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
 async function handleSaveJson(event, data) {
    try {
        fs.writeFileSync(data.path, JSON.stringify(data.labels));
        return "Saved labels at " + data.path;
    } catch (e) {
        return "Error when saving labels.";
    }
}


