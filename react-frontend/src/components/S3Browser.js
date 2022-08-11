import { Component } from 'react';
import S3Folder from "./S3Folder.js";
import S3File from "./S3File.js";
const { image_types } = require("../../public/electron_constants.js");
const { s3_browser_modes } = require("../QASM/constants.js");

class S3Browser extends Component {

    constructor(props) {
        super(props);
        
        this.QASM    = props.QASM
        this.mode    = window.S3_BROWSER_MODE // Set by window opener
        this.parents = props.parents || [] // Stack of parent folders
        this.path    = props.path    || ""
        this.folders = props.folders || this.QASM.folders
        this.files   = props.files   || this.QASM.files

        this.state = {
            path: this.path
        };

        console.log(this.mode);

        // Bind functions
        this.selectFolder = this.selectFolder.bind(this);
        this.changePath   = this.changePath.bind(this);
        this.goBack       = this.goBack.bind(this);
        this.selectFile   = this.selectFile.bind(this);
        this.createFile   = this.createFile.bind(this);
    }

    selectFolder() {
        
        let images_present = false;
        for (let file of this.files) {
            let ext = file.split('.').pop()
            if (ext in image_types) {
                images_present = true;
                break;
            }
        }
        
        if (images_present) {
            let data = {
                success: true,
                path: this.path,
            }
            // Send data back to parent window
            window.opener.postMessage(data, '*');
            window.close();
        } else {
            alert("No images found in folder " + this.path);
        }
    }
    
    selectFile(file) {
        if (this.mode === s3_browser_modes.SELECT_JSON) {
            let ext = file.split('.').pop()
            if (ext.toLowerCase() === "json") {
                let data = {
                    success: true,
                    path: file,
                }
                // Send data back to parent window
                window.opener.postMessage(data, '*');
                window.close();
            } else {
                alert("Selected file not of type json.");
            }
        }
    }

    createFile() {
        let new_filename = document.getElementById("new-filename").value;
        // Space -> underscore, remove extension
        new_filename = new_filename.replace(" ", "_").split('.')[0];
        // Save as json
        new_filename = new_filename + ".json";
        // Add full path
        new_filename = this.path + new_filename;
        
        /* eslint-disable */
        // Prompt user to confirm, then save
        if (confirm("Save to new file " + new_filename + "?")) {
            this.selectFile(new_filename);
        }
    }


    async changePath(folder) {
        try {
            let response = await this.QASM.call_backend(window, "openS3Folder", folder);
            this.folders = response.folders;
            this.files = response.files;
            this.parents.push(this.path);
            this.path = folder;

            this.setState({
                path: this.path
            });
        } catch {
            console.log("Failed to load " + folder);
        }
    }

    async goBack() {
        let folder = this.parents.pop();
        try {
            let response = await this.QASM.call_backend(window, "openS3Folder", folder);
            this.folders = response.folders;
            this.files = response.files;
            this.path = folder;

            this.setState({
                path: this.path
            });
        } catch {
            console.log("Failed to go back to " + folder);
            this.parents.push(folder);
        }
    }

    render() {
        return (
            <div>
                <h2>S3 Browser: {this.QASM.s3_bucket}</h2>
                {this.mode === s3_browser_modes.SELECT_DIRECTORY &&
                    <button 
                        onClick={this.selectFolder}>
                        Select Directory: {this.path}
                    </button>
                }<br/>
                {this.mode === s3_browser_modes.SELECT_JSON &&
                    <div>
                        <button 
                            onClick={this.createFile}>
                            Save Here to New File:
                        </button>
                        <input
                            id="new-filename"
                            type="text"
                        />
                    </div>
                }<br/>
                {this.parents.length !== 0 &&
                    <button 
                        onClick={this.goBack}>
                        Back
                    </button>
                }
                {this.folders.map(folder_name => (
                    <div onClick={e => this.changePath(e.target.id)} key={folder_name}>
                        <S3Folder
                            path={folder_name}/>  
                    </div>
                ))}
                {this.files.map(file_name => (
                    <div onClick={e => this.selectFile(e.target.id)} key={file_name}>
                        <S3File
                            key={file_name}
                            path={file_name}/> 
                    </div> 
                ))}
            </div>
        )
    }
}

export default S3Browser;