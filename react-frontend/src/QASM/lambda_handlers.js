const { api_consolidator_error_handler } = require("./api_utils.js");
const { function_names } = require("../../public/electron_constants.js");

exports.function_handlers = {
    [function_names.SAVE_LABELS]:  handleSaveLabels,
    [function_names.LOAD_LABELS]:  handleLoadLabels,
    [function_names.OPEN_DIR]:     handleOpenDir,
    [function_names.LOAD_IMAGES]:  handleLoadImages,
    [function_names.SAVE_FILE]:    handleSaveFile,
    "openS3Folder":                handleOpenS3Folder,
}

function handleSaveLabels(QASM, data, window) {

}

function handleLoadLabels(QASM, data, window) {
    
}

/**
 * Open a directory selection dialog
 * @param QASM QASM object
 * @param data s3 prefix
 * @returns dir path on sucess, nothing on cancel
 */
async function handleOpenDir(QASM, data, window) {
    let url = window.location.origin + "/#/s3Browser";
    window.open(url, "S3 Browser");

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

function handleSaveFile(QASM, data, window) {
    
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