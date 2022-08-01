// Definitions for base QASM class.
const constants = require("./constants.js");

export class QASM {
    static create() {
        return new this.subClasses[constants.local_env.QASM_MODE]()
    } 
}

export class QASM_s3 extends QASM {
    constructor() {
        super();
        this.mode = "s3";
    }

    /* TODO:
        call_backend
    */
    
}

export class QASM_Local extends QASM {
    constructor() {
        super();
        this.mode = "local";
    }

    async call_backend (window, function_name, data) {
        return await window.electron.invoke(function_name, data);
    }
}

QASM.subClasses = {
    "local": QASM_Local,
    "s3": QASM_s3,
}