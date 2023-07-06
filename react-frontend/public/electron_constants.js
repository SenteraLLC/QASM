// Constants. Be careful not to include imports in this file 
// so that it can be used by the react frontend without issue.

// List of valid function name keys
exports.function_names = {
    SAVE_BINARY_DIRECTORY: "saveBinaryDirectory",
    OPEN_DIR_DIALOG: "openDir",
    OPEN_IMG_DIR_DIALOG: "openImgDir",
    OPEN_IMG_DIALOG: "openImg",
    LOAD_LABELS_DIALOG: "loadLabels",
    LOAD_IMAGE_DIALOG: "loadImage",
    LOAD_IMAGES_DIALOG: "loadImages",
    SAVE_JSON_DIALOG: "saveJsonFile",
    SAVE_JSON: "saveJsonToPath",
    SAVE_IMAGE_DIALOG: "saveImage",
    GET_CASCADING_DIR_CHILDREN: "getCascadingChildren",
    OPEN_FOLDER: "openS3Folder",
    LOAD_JSON: "loadJson",
}

// List of accepted image types
exports.image_types = {
    JPG: "JPG",
    PNG: "PNG",
    jpg: "jpg",
    png: "png",
}