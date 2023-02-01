import { function_names } from "../../public/electron_constants.js";

// Definitions for base QASM class.
const { function_handlers } = require("./lambda_handlers.js");

export class QASM {
    /**
     * Create a QASM object based on the
     * app mode in the config
     * 
     * @param {Object} config QASM config object
     * @param {Object} package_json package.json object w/version, app name, etc.
     * @returns {Object} QASM Object
     */
    static create(config, package_json) {
        config["version"] = package_json["version"]; // Get version from package.json
        return new this.subClasses[config.app](config)
    }
}

export class QASM_s3 extends QASM {
    constructor(config) {
        super(config);
        this.mode = "s3";
        this.config = config;
        this.s3_bucket = this.config.bucket;
        this.folders = [];
        this.files = [];
    }
    
    /**
     * Call a backend function and return the response
     * 
     * @param {*} window window
     * @param {string} function_name function name
     * @param {*} data data
     * @returns {*} function response
     */
    async call_backend(window, function_name, data=null) {
        return await function_handlers[function_name](this, data, window);
    }    

    /**
     * Initialize the first level of the s3 bucket
     * 
     * @returns {Object} Initialized QASM Object
     */
    async init() {
        // Preload first level of s3 bucket
        let response = await this.call_backend(window, function_names.OPEN_S3_FOLDER, null);
        this.folders = response.folders;
        this.files = response.files;
        return this;
    }
}

export class QASM_Local extends QASM {
    constructor(config) {
        super(config);
        this.mode = "local";
        this.config = config;
    }

    /**
     * Call a backend function and return the response
     * 
     * @param {*} window window
     * @param {string} function_name function name
     * @param {*} data data
     * @returns {*} function response
     */
    async call_backend (window, function_name, data) {
        return await window.electron.invoke(function_name, data);
    }

    /**
     * Initialize
     * 
     * @returns {Object} Initialized QASM Object
     */
    async init() {
        // Nothing
        return this;
    }
}

QASM.subClasses = {
    "local": QASM_Local,
    "s3": QASM_s3,
}