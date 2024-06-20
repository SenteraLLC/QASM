// Constants. Be careful not to include imports in this file 
// so that it can be used by the react frontend without issue.

// List of valid components
exports.components = {
    GRID: "grid",
    MULTI_CLASS_GRID: "multiclassgrid",
    HOME: "home",
    BINARY_EDITOR: "binaryeditor",
    S3_BROWSER: "S3Browser",
    IMAGE_LABELER: "imagelabeler",
    INPUT: "input",
}

// List of valid function name keys
exports.function_names = {
    SAVE_BINARY_DIRECTORY: "saveBinaryDirectory",
    OPEN_DIR_DIALOG: "openDirDialog",
    OPEN_IMAGE_DIR_DIALOG: "openImageDirDialog",
    LOAD_IMAGE_DIALOG: "loadImageDialog",
    LOAD_JSON_DIALOG: "loadJsonDialog",
    LOAD_IMAGES: "loadImages",
    LOAD_BASE64_IMAGES: "loadBase64Images",
    SAVE_JSON_DIALOG: "saveJsonDialog",
    SAVE_JSON: "saveJson",
    SAVE_IMAGE_DIALOG: "saveImageDialog",
    GET_CASCADING_DIR_CHILDREN: "getCascadingChildren",
    GET_FOLDER_CONTENTS: "getFolderContents",
    LOAD_JSON: "loadJson",
    TRIGGER_INPUT_LAMBDA: "triggerInputLambda",
}

// List of accepted image types
exports.image_types = {
    JPG: "JPG",
    PNG: "PNG",
    jpg: "jpg",
    png: "png",
}

// S3 Browser modes
exports.s3_browser_modes = {
    SELECT_DIRECTORY: "select_directory",
    SELECT_IMG_DIRECTORY: "select_img_directory",
    SELECT_JSON: "select_json",
    SAVE_JSON: "save_json",
    SELECT_IMAGE: "select_image",
    SAVE_IMAGE: "save_image",
    DEEP_LINK: "deep_link",
}

exports.s3_protocol = "s3" // followed by '://', e.g. 's3://'