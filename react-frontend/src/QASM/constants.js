// Constants for QASM

exports.local_paths = {
    CONFIG_PATH: "../../config.json",
}

exports.local_env = {
    API_URL: process.env.REACT_APP_API_URL,
}

exports.s3_browser_modes = {
    SELECT_DIRECTORY: "select_directory",
    SELECT_IMG_DIRECTORY: "select_img_directory",
    SELECT_JSON: "select_json",
    SAVE_JSON: "save_json",
    SELECT_IMAGE: "select_image",
    SAVE_IMAGE: "save_image",
}