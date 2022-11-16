// Constants. Be careful not to include imports in this file 
// so that it can be used by the react frontend without issue.

// List of valid function name keys
exports.function_names = {
    SAVE_BINARY_DIRECTORY: "saveBinaryDirectory",
    OPEN_DIR: "openDir",
    OPEN_IMG_DIR: "openImgDir",
    OPEN_IMG: "openImg",
    LOAD_LABELS: "loadLabels",
    LOAD_IMAGE: "loadImage",
    LOAD_IMAGES: "loadImages",
    SAVE_JSON_FILE: "saveJsonFile",
    SAVE_JSON_TO_PATH: "saveJsonToPath",
    SAVE_IMAGE: "saveImage",
    OPEN_S3_FOLDER: "openS3Folder",
    LOAD_JSON: "loadJson",
}

// List of accepted image types
exports.image_types = {
    JPG: "JPG",
    PNG: "PNG",
    jpg: "jpg",
    png: "png",
}