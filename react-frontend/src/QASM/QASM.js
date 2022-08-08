// Definitions for base QASM class.
const constants = require("./constants.js");
const { function_handlers } = require("./lambda_handlers.js");

export class QASM {
    static create(config) {
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
    
    async call_backend (window, function_name, data=null) {
        return await function_handlers[function_name](this, data, window);
    }    

    async init() {
        let response = await this.call_backend(window, "openS3Folder", null);
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

    async call_backend (window, function_name, data) {
        return await window.electron.invoke(function_name, data);
    }

    async init() {
        // Nothing
        return this;
    }
}

QASM.subClasses = {
    "local": QASM_Local,
    "s3": QASM_s3,
}