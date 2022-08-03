// Definitions for base QASM class.
const constants = require("./constants.js");

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
    }

    /* TODO:
        call_backend
    */
    
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
}

QASM.subClasses = {
    "local": QASM_Local,
    "s3": QASM_s3,
}