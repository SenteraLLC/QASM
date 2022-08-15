import { Component } from 'react';
import S3Folder from "./S3Folder.js";
import S3File from "./S3File.js";
const { image_types } = require("../../public/electron_constants.js");
const { s3_browser_modes } = require("../QASM/constants.js");

class S3Browser extends Component {
    component_updater = 0;

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

        // Bind functions
        this.selectFolder      = this.selectFolder.bind(this);
        this.changePath        = this.changePath.bind(this);
        this.goBack            = this.goBack.bind(this);
        this.selectFile        = this.selectFile.bind(this);
        this.createFile        = this.createFile.bind(this);
        this.getDisplayMode    = this.getDisplayMode.bind(this);
        this.updateDisplayMode = this.updateDisplayMode.bind(this);
    }


    /**
     * Check that current folder has images,
     * then send folder path to the main window.
     */
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
    

    /**
     * Check if selected file is of the correct type,
     * then send the filepath to the main window.
     * 
     * @param {string} file filename
     */
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


    /**
     * Scrape user filename from the input and
     * ask the user to confirm before saving.
     */
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


    /**
     * Change the active path to a new folder
     * and populate its folders and files 
     * 
     * @param {string} folder folder name
     */
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


    /**
     * Go up one folder level and
     * populate the folders and files
     */
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


    /**
     * Checks which mode is selected and returns that value. If the mode select
     * buttons haven't loaded in yet, then it returns the default of grid.
     * 
     * @returns {string} Display mode as string
     */
    getDisplayMode() {
        if (document.querySelector("input[name='display']:checked") === null) {
            return "grid";
        }
        else {
            return document.querySelector("input[name='display']:checked").value
        }
    }


    /**
     * Updates the class on the div that holds all of the s3 stuff.
     */
    updateDisplayMode() {
        document.getElementById("s3-folder-holder").className = this.getDisplayMode();
    }

    
    render() {
        return (
            <div className="S3Folder">
                <h2>S3 Browser: {this.QASM.s3_bucket}</h2>
                <fieldset className="directory-display-mode">
                    <legend>Display Mode</legend>
                    <div>
                        <input type="radio" id="grid-display" name="display" value="grid" onChange={this.updateDisplayMode} defaultChecked />
                        <label htmlFor="grid-display">Grid</label>
                    </div>
                    <div>
                        <input type="radio" id="list-display" name="display" value="list" onChange={this.updateDisplayMode} />
                        <label htmlFor="list-display">List</label>
                    </div>
                </fieldset>
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
                <div className={this.getDisplayMode()} id="s3-folder-holder">
                    {this.folders.map(folder_name => (
                        <div onClick={e => this.changePath(folder_name)} key={folder_name} className="clickable">
                            <S3Folder
                                path={folder_name}/>  
                        </div>
                    ))}
                    {this.files.map(file_name => (
                        <div onClick={e => this.selectFile(file_name)} key={file_name} className="clickable">
                            <S3File
                                key={file_name}
                                path={file_name}/> 
                        </div> 
                    ))}
                </div>
            </div>
        )
    }
}

export default S3Browser;