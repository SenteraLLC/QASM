const { api_consolidator_error_handler } = require("./api_utils.js");
const { get_new_window_url } = require("./utils.js");
const { function_names } = require("../../public/electron_constants.js");
const { s3_browser_modes } = require("./constants.js");

// Export like this so static site works idk why
const function_handlers = {
    [function_names.SAVE_BINARY_DIRECTORY]:      saveBinaryDirectory,
    [function_names.LOAD_LABELS]:                handleLoadLabels,
    [function_names.LOAD_IMAGE]:                 handleLoadImage,
    [function_names.LOAD_IMAGES]:                handleLoadImages,
    [function_names.OPEN_DIR]:                   handleOpenDir,
    [function_names.OPEN_IMG_DIR]:               handleOpenImgDir,
    [function_names.OPEN_IMG]:                   handleLoadImage,
    [function_names.SAVE_IMAGE]:                 handleSaveImage,
    [function_names.LOAD_JSON]:                  handleLoadJson,
    [function_names.SAVE_JSON_FILE]:             handleSaveJSON,
    [function_names.SAVE_JSON_TO_PATH]:          handleSaveJSONtoPath,
    [function_names.OPEN_S3_FOLDER]:             handleOpenS3Folder,
    [function_names.GET_CASCADING_DIR_CHILDREN]: getS3FolderChildren,
}
export { function_handlers }


/**
 * Prompt the user to select a save destination,
 * and then save the labels.
 * 
 * @param {Object} QASM QASM object
 * @param {Object} data {labels: {}, path: "", savename: ""}
 * @param {*} window window
 * @returns {string} result
 */
async function handleSaveJSON(QASM, data, window) {
    let url = get_new_window_url(window, "s3Browser");
    let popup = window.open(url, "S3 Browser");
    popup.S3_BROWSER_MODE = s3_browser_modes.SAVE_JSON;
    popup.START_FOLDER = data.path;
    popup.DEFAULT_SAVENAME = data.savename;

    return new Promise(resolve => window.onmessage = async (e) => {
        try {
            if (e.data.success) {
                let params = {
                    bucket_name: QASM.s3_bucket,
                    file_name: e.data.path,
                    labels: data.labels,
                }
                resolve(await api_consolidator_error_handler(params, "save_labels"));
            }
        } catch {
            resolve("Error when saving labels.");
        }
    });
}

/**
 * Save data to the specified path.
 * 
 * @param {Object} QASM QASM object
 * @param {Object} data {labels: {}, path: ""}
 * @param {*} window window
 * @returns {string} result
 */
 async function handleSaveJSONtoPath(QASM, data, window) {
    try { 
        let params = {
            bucket_name: QASM.s3_bucket,
            file_name: data.path,
            labels: data.labels,
        }
        await api_consolidator_error_handler(params, "save_labels");
    } catch {
        console.log("Error when saving labels.");
    }
}


/**
 * Save an image to s3
 * 
 * @param {Object} QASM QASM object
 * @param {string} data image
 * @param {*} window window
 */
async function handleSaveImage(QASM, data, window) {
    let url = get_new_window_url(window, "s3Browser");
    let popup = window.open(url, "S3 Browser");
    popup.S3_BROWSER_MODE = s3_browser_modes.SAVE_IMAGE;

    return new Promise(resolve => window.onmessage = async (e) => {
        try {
            if (e.data.success) {
                let params = {
                    bucket_name: QASM.s3_bucket,
                    file_name: e.data.path,
                    image: data,
                }
                resolve(await api_consolidator_error_handler(params, "save_image"));
            }
        } catch {
            resolve("Error when saving image.");
        }
    });
}


/**
 * Prompt the user to select a file,
 * and then load and return the labels.
 * 
 * @param {Object} QASM QASM object
 * @param {string} data starting folder
 * @param {*} window window
 * @returns {Object} labels
 */
async function handleLoadLabels(QASM, data, window) {
    let url = get_new_window_url(window, "s3Browser");
    let popup = window.open(url, "S3 Browser");
    // TODO: different mode for loading/saving?
    popup.S3_BROWSER_MODE = s3_browser_modes.SELECT_JSON; 
    popup.START_FOLDER = data.path;
    popup.LOADNAMES = data.loadnames;

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
 * Get url for a single image
 * @param {Object} QASM QASM object
 * @param {string} data starting folder
 * @param {*} window window
 * @returns {*} image url
 */
async function handleLoadImage(QASM, data, window) {
    console.log("Handle open image");
    let url = get_new_window_url(window, "s3Browser");
    let popup = window.open(url, "S3 Browser");
    popup.S3_BROWSER_MODE = s3_browser_modes.SELECT_IMAGE;
    popup.START_FOLDER = data

    return new Promise(resolve => window.onmessage = async (e) => {
        try {
            if (e.data.success) {
                let params = {
                    bucket_name: QASM.s3_bucket,
                    file_name: e.data.path,
                }
                let res = await api_consolidator_error_handler(params, "load_image");
                resolve(res.url);
            }
        } catch {}
    });
}


/**
 * Open a directory selection dialog
 *
 * @param {Object} QASM QASM object
 * @param {string} data starting folder
 * @param {*} window window
 * @returns s3 path on success, nothing on cancel
 */
async function handleOpenDir(QASM, data, window) {
    let url = get_new_window_url(window, "s3Browser");
    let popup = window.open(url, "S3 Browser");
    popup.S3_BROWSER_MODE = s3_browser_modes.SELECT_DIRECTORY;
    popup.START_FOLDER = data

    return new Promise(resolve => window.onmessage = (e) => {
        try {
            if (e.data.success) {
                resolve(e.data.path);
            }
        } catch {}
    });
}

/**
 * Open a directory selection dialog that
 * only allows folders that contain images
 *
 * @param {Object} QASM QASM object
 * @param {string} data starting folder
 * @param {*} window window
 * @returns s3 path on success, nothing on cancel
 */
 async function handleOpenImgDir(QASM, data, window) {
    let url = get_new_window_url(window, "s3Browser");
    let popup = window.open(url, "S3 Browser");
    popup.S3_BROWSER_MODE = s3_browser_modes.SELECT_IMG_DIRECTORY;
    popup.START_FOLDER = data

    return new Promise(resolve => window.onmessage = (e) => {
        try {
            if (e.data.success) {
                resolve(e.data.path);
            }
        } catch {}
    });
}


/**
 * Get signed urls for all images in an s3 folder
 * 
 * @param {Object} QASM QASM object
 * @param {string} data full s3 path
 * @param {*} window window
 * @returns {Object} { image_name: signed_url } 
 */
async function handleLoadImages(QASM, data, window) {
    let params = {
        "bucket_name": QASM.s3_bucket,
        "folder_name": data
    }
    let res = await api_consolidator_error_handler(params, "get_signed_urls_in_folder");
    return res.urls;
}


/**
 * Get file and folder names from an s3 folder path
 * 
 * @param {Object} QASM QASM object
 * @param {string} data s3 prefix
 * @param {*} window window 
 * @returns {Object} { folders: [], files: [] }
 */
async function handleOpenS3Folder(QASM, data, window) {
    let params = {
        "bucket": QASM.s3_bucket,
        "prefix": data
    }
    return await api_consolidator_error_handler(params, "open_dir");
}

/**
 * 
 * @param {Object} QASM Qasm object
 * @param {*} data {}
 * @param {*} window window
 * @returns {string} ECS response message
 */
async function getS3FolderChildren(QASM, data, window) {
    const params = {
        "bucket": QASM.s3_bucket,
        "prefix": data
    }
    return await api_consolidator_error_handler(params, "get_cascading_dir_children");
}


/**
 * 
 * @param {Object} QASM QASM object 
 * @param {Object} data { src_dir: string, operations: string, dest_dir: string }
 * @param {*} window window
 * @returns {string} ECS response message
 */
async function saveBinaryDirectory(QASM, data, window) {
    // Create parameters
    let params = {
        "bucket_name": QASM.s3_bucket,
    }

    // Add parameters passed in as 'data'
    for (let [key, value] of Object.entries(data)) {
        params[key] = value;
    }
    console.log("params", params);
    return await api_consolidator_error_handler(params, "ecs_binary_directory")
}

/**
 * Get annotation json from an s3 folder
 * 
 * @param {Object} QASM QASM object
 * @param {string} data full s3 path to file
 * @param {*} window window
 * @returns {Object} annotation json
 */
 async function handleLoadJson(QASM, data, window) {
    let params = {
        "bucket_name": QASM.s3_bucket,
        "file_name": data
    }
    let res = await api_consolidator_error_handler(params, "load_labels");
    return res.labels;
}