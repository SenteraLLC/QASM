// Utils for handling deep links
const { s3_protocol, components, image_types } = require("./electron_constants.js");
const { getFileAndFolder } = require("./electron_utils.js");

/**
 * Open a deep link.
 * 
 * @param {Object} config config object
 * @param {Object} mainWindow electron BrowserWindow object
 * @param {string} deep_link full deep link, 's3://<bucket-name>/<s3_key>'
 */
exports.openDeepLink = async (config, mainWindow, deep_link)  => {
    // remove s3 and the '://'
    let s3_path = deep_link.slice(s3_protocol.length + "://".length); 
    // get the first part of the path, which is the bucket name
    let bucket_name = s3_path.split("/")[0];
    // get the rest of the path, which is the folder name
    let start_folder = s3_path.slice(bucket_name.length + 1);

    // get the active component
    let awaiting_response = true
    let active_component;
    while (awaiting_response) {
        try {
            active_component = await mainWindow.webContents.executeJavaScript("window.COMPONENT.props.component");
            mainWindow.webContents.executeJavaScript(`console.log("${active_component}");`)
            awaiting_response = false
        } catch (error) {
            // wait 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // If the active component is not in the user-specified list,
    // then default to the first component in the list
    if (!config.intercept_s3_protocol.includes(active_component)) {
        active_component = config.intercept_s3_protocol[0];
        // Click on router link to change to the component
        mainWindow.webContents.executeJavaScript(`document.getElementById("${active_component}-link").click();`);
        // Wait for the component to load
        await mainWindow.webContents.executeJavaScript(`window.COMPONENT.props.component === "${active_component}"`);
    }

    let file_name;
    switch (active_component) {
        case components.GRID:
        case components.MULTI_CLASS_GRID:
            // For grids, if the path is a json file, then load the labels
            // Otherwise, we open a directory select dialog
            if (isJsonFile(start_folder)) {
                // separate file name and folder
                let ret = getFileAndFolder(start_folder);
                file_name = ret.file_name;
                start_folder = ret.folder;
                mainWindow.webContents.executeJavaScript(`console.log(decodeURI("${start_folder}")); window.COMPONENT.loadLabels(window, window.COMPONENT, ["${file_name}"], decodeURI("${start_folder}"));`);
            } else {
                mainWindow.webContents.executeJavaScript(`window.COMPONENT.src = decodeURI("${start_folder}"); window.COMPONENT.loadImageDir(window, window.COMPONENT, decodeURI("${bucket_name}"));`);
            }
            break;
        case components.IMAGE_LABELER:
            // For image labeler, if the path is a json file, then load the labels
            // If an image, then load the image
            // Otherwise, we open a directory select dialog
            if (isJsonFile(start_folder)) {
                // separate file name and folder
                let ret = getFileAndFolder(start_folder);
                file_name = ret.file_name;
                start_folder = ret.folder;
                mainWindow.webContents.executeJavaScript(`window.COMPONENT.anno_dir = decodeURI("${start_folder}"); window.COMPONENT.QASM.s3_bucket = decodeURI("${bucket_name}"); window.COMPONENT.loadAnnotations("${file_name}");`);
            } else if (isImageFile(start_folder)) {
                let ret = getFileAndFolder(start_folder);
                start_folder = ret.folder;
                // remove extension from file name by removing the "." and everything after
                file_name = ret.file_name.split(".")[0];
                mainWindow.webContents.executeJavaScript(`window.COMPONENT.image_dir = decodeURI("${start_folder}"); window.COMPONENT.QASM.s3_bucket = decodeURI("${bucket_name}"); window.COMPONENT.loadImageDir("${file_name}");`);
            } else {
                mainWindow.webContents.executeJavaScript(`window.COMPONENT.selectDirType(decodeURI("${start_folder}"), decodeURI("${bucket_name}"));`);
            }
            break;
        default:
            break;
    }
    // mainWindow.webContents.executeJavaScript(`try{let popup}catch{}; popup = window.open(window.location.href, "S3 Browser"); popup.window.S3_BROWSER_MODE = "${s3_browser_modes.DEEP_LINK}"; popup.window.START_FOLDER = decodeURI("${start_folder}"); popup.window.BUCKET_NAME = decodeURI("${bucket_name}");`)
};


/**
 * Check if a path is a json file.
 * 
 * @param {string} path path to check
 * @returns {boolean} true if path is a json file, false otherwise
 */
function isJsonFile(path) {
    return path.slice(-5).toLowerCase() === ".json";
}


/**
 * Check if a path is an image file.
 * 
 * @param {string} path path to check
 * @returns {boolean} true if path is an image file, false otherwise
 */
function isImageFile(path) {
    return path.slice(-3) in image_types;
}
