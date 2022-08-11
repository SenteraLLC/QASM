const { api_consolidator_error_handler } = require("./api_utils.js");
const { function_names } = require("../../public/electron_constants.js");
const { s3_browser_modes } = require("./constants.js");

// Export like this so static site works idk why
const function_handlers = {
    [function_names.SAVE_LABELS]:  handleSaveLabels,
    [function_names.LOAD_LABELS]:  handleLoadLabels,
    [function_names.OPEN_DIR]:     handleOpenDir,
    [function_names.LOAD_IMAGES]:  handleLoadImages,
    [function_names.SAVE_FILE]:    handleSaveFile,
    "openS3Folder":                handleOpenS3Folder,
}
export { function_handlers }

/**
 * Prompt the user to select a save destination,
 * and then save the labels.
 * 
 * @param {Object} QASM QASM object
 * @param {Object} data object with all the labels
 * @param {*} window window
 * @returns {string} result
 */
async function handleSaveFile(QASM, data, window) {
    let url = window.location.origin + "/#/s3Browser";
    let popup = window.open(url, "S3 Browser");
    popup.S3_BROWSER_MODE = s3_browser_modes.SELECT_JSON;

    return new Promise(resolve => window.onmessage = async (e) => {
        try {
            if (e.data.success) {
                let params = {
                    bucket_name: QASM.s3_bucket,
                    file_name: e.data.path,
                    labels: data,
                }
                resolve(await api_consolidator_error_handler(params, "save_labels"));
            }
        } catch {
            resolve("Error when saving labels.");
        }
    });
}

/**
 * Prompt the user to select a file,
 * and then load and return the labels.
 * 
 * @param {Object} QASM QASM object
 * @param {*} data data
 * @param {*} window window
 * @returns {Object} labels
 */
async function handleLoadLabels(QASM, data, window) {
    let url = window.location.origin + "/#/s3Browser";
    let popup = window.open(url, "S3 Browser");
    // TODO: different mode for loading/saving?
    popup.S3_BROWSER_MODE = s3_browser_modes.SELECT_JSON; 

    return new Promise(resolve => window.onmessage = async (e) => {
        try {
            if (e.data.success) {
                let params = {
                    bucket_name: QASM.s3_bucket,
                    file_name: e.data.path,
                }
                let res = await api_consolidator_error_handler(params, "load_labels");
                resolve(res.labels);
            }
        } catch {
            console.log("Error when loading labels.")
            resolve({});
        }
    });
}

/**
 * Open a directory selection dialog
 *
 * @returns s3 path on sucess, nothing on cancel
 */
async function handleOpenDir(QASM, data, window) {
    let url = window.location.origin + "/#/s3Browser";
    let popup = window.open(url, "S3 Browser");
    popup.S3_BROWSER_MODE = s3_browser_modes.SELECT_DIRECTORY;

    return new Promise(resolve => window.onmessage = (e) => {
        try {
            if (e.data.success) {
                resolve(e.data.path);
            }
        } catch {}
    });
}

async function handleLoadImages(QASM, data, window) {
    let params = {
        "bucket_name": QASM.s3_bucket,
        "folder_name": data
    }
    let res = await api_consolidator_error_handler(params, "get_signed_urls_in_folder");
    return res.urls;
}

function handleSaveLabels(QASM, data, window) {
    
}


/**
 * Get file and folder names from an s3 folder path
 * @param QASM QASM object
 * @param data s3 prefix
 * @returns {object} { folders: [], files: [] }
 */
async function handleOpenS3Folder(QASM, data, window) {
    // Setup S3 Browser
    let params = {
        "bucket": QASM.s3_bucket,
        "prefix": data
    }
    return await api_consolidator_error_handler(params, "open_dir");
}