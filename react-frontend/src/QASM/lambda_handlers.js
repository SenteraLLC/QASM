const { api_consolidator_error_handler } = require("./api_utils.js");
const { function_names } = require("../../public/electron_constants.js");

exports.function_handlers = {
    [function_names.SAVE_LABELS]:  handleSaveLabels,
    [function_names.LOAD_LABELS]:  handleLoadLabels,
    [function_names.OPEN_DIR]:     handleOpenDir,
    [function_names.LOAD_IMAGES]:  handleLoadImages,
    [function_names.SAVE_FILE]:    handleSaveFile,
}

function handleSaveLabels(QASM, data) {

}

function handleLoadLabels(QASM, data) {
    
}

/**
 * Open a directory selection dialog
 * 
 * @returns dir path on sucess, nothing on cancel
 */
async function handleOpenDir(QASM, data) {
    console.log(QASM);
    return await api_consolidator_error_handler(QASM.s3_bucket, "open_dir")
}

function handleLoadImages(QASM, data) {
    
}

function handleSaveFile(QASM, data) {
    
}