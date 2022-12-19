import { Component } from 'react';
import Dropdown from "./Dropdown.js";
import S3Folder from "./S3Folder.js";
import S3File from "./S3File.js";
import "../css/S3Browser.css";
const { image_types, function_names } = require("../../public/electron_constants.js");
const { s3_browser_modes } = require("../QASM/constants.js");

class S3Browser extends Component {
    component_updater = 0;
    path_segments_children = [];
    redo_stack = [];
    cached_folder_structure = {};
    cashe = {};

    constructor(props) {
        super(props);
        
        this.QASM    = props.QASM
        this.mode    = window.S3_BROWSER_MODE // Set by window opener
        this.path    = window.START_FOLDER
        this.parents = props.parents || [] // Stack of parent folders
        
        if (this.path == null) {
            this.path = "" 
            this.folders = this.QASM.folders
            this.files   = this.QASM.files
        } else {
            this.setS3Path(this.path);
        }

        this.state = {
            path: this.path
        };

        // Bind functions
        this.selectFolder            = this.selectFolder.bind(this);
        this.changePath              = this.changePath.bind(this);
        this.goBack                  = this.goBack.bind(this);
        this.getFolders              = this.getFolders.bind(this);
        this.selectFile              = this.selectFile.bind(this);
        this.createFile              = this.createFile.bind(this);
        this.getDisplayMode          = this.getDisplayMode.bind(this);
        this.updateDisplayMode       = this.updateDisplayMode.bind(this);
        this.setS3Path               = this.setS3Path.bind(this);
        this.readS3Link              = this.readS3Link.bind(this);
        this.getPathSegmentsChildren = this.getPathSegmentsChildren.bind(this);
        this.createPath              = this.createPath.bind(this);
        this.handleKeyPress          = this.handleKeyPress.bind(this);
        this.goForward               = this.goForward.bind(this);
        this.addCache = this.addToCache.bind(this)
        this.getNavigationInfo = this.getNavigationInfo.bind(this);
    }


    /**
     * Change the current location to be at the given s3 path.
     * 
     * @param {string} path s3 path
     */
    setS3Path(path) {
        this.path = path;
        this.folders = []
        this.files = []
            
        // Populate parent stack
        this.parents = [""]
        let folders = path.split("/").slice(0, -2);
        for (let i=0; i < folders.length; i++) {
            this.parents.push(this.parents[i] + folders[i] + "/");
        }
        
        this.changePath({"folder": path}).then(() => {
            this.parents.pop(); // Remove starting path from parent stack
        });
    }


    /**
     * Check that current folder has images, then send folder path to the main window.
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
    selectFile(file, seek_confirmation = true) {
        // Exclude SELECT_DIRECTORY mode from selecting files
        if (this.mode !== s3_browser_modes.SELECT_DIRECTORY) {

            // Grab the file's extension
            let ext = file.split('.').pop()

            // Check the file extension to see if its valid in the current mode
            switch(this.mode) {
                case s3_browser_modes.SELECT_JSON:
                case s3_browser_modes.SAVE_JSON:
                    if (ext.toLowerCase() !== "json") {
                        alert("Selected file not of type json.");
                        return;
                    }
                    break;

                case s3_browser_modes.SELECT_IMAGE:
                case s3_browser_modes.SAVE_IMAGE:
                    // Alert user and return early if file extension isn't in image_types
                    if (!(ext in image_types)) {
                        alert("Selected file does not have supported image extension.");
                        return;
                    }
                    else {
                        console.log("Clicked on an image")
                    }
                    break;

                default:
                    alert("Unsupported mode: " + this.mode);
                    return;
            }

            // Ask for confirmation if confirmation is requested and in a saving mode
            if (seek_confirmation && (this.mode === s3_browser_modes.SAVE_IMAGE || this.mode === s3_browser_modes.SAVE_JSON)) {
                // If we don't recieve an affermative answer return early
                if (!window.confirm("Are you sure you want to overwrite " + file + "?")) {
                    return;
                }
            }

            console.log("final code being called")
            let data = {
                success: true,
                path: file,
            }
            // Send data back to parent window
            window.opener.postMessage(data, '*');
            window.close();
        }
    }


    /**
     * Scrape user filename from the input and
     * ask the user to confirm before saving.
     */
    createFile(current_mode) {
        // Get the extention type based on browser mode
        let extension;
        switch(current_mode) {
            case s3_browser_modes.SELECT_JSON:
            case s3_browser_modes.SAVE_JSON:
                extension = ".json";
                break;
            
            case s3_browser_modes.SELECT_IMAGE:
            case s3_browser_modes.SAVE_IMAGE:
                extension = ".png";
                break;

            default:
                throw new Error("Trying to create image with unknown file type.");
        }

        const new_filename_input = document.getElementById("new-filename")
        let new_filename = new_filename_input.value;

        // Make sure the filename isn't blank
        if (new_filename === "") {
            // TODO: Show an alert if the user trys to save without a filename
            // The built-in javascript alert() was causing a weird bug with electron
            console.warn("No filename provided")
            new_filename_input.focus();
            return
        }

        new_filename = new_filename.replace(" ", "_").split('.')[0]; // Space -> underscore, remove extension
        new_filename = new_filename + extension; // Save with proper extension
        new_filename = this.path + new_filename; // Add full path
        
        /* eslint-disable */
        // Prompt user to confirm, then save
        if (confirm("Save file as " + new_filename + "?")) {
            this.selectFile(new_filename, false);
        }
    }


    /**
     * Scrape s3 link from the input and
     * ask the user to confirm before navigating.
     */
    readS3Link() {
        let link = document.getElementById("s3-link").value;
        /* eslint-disable */
        // Prompt user to confirm, then save
        if (confirm("Go to path ' " + link + " ' ?")) {
            this.setS3Path(link);
        }
    }


    /**
     * Change the active path to a new folder
     * and populate its folders and files 
     * 
     * @param {Object} kwargs {
     *  {string} folder: Folder to change the path to, 
     *  {Boolean} flush_redo_stack: Whether or not to reset the redo stack, 
     *  {Boolean} add_to_parents: Whether or not to add the previous path to the parent stack
     * }
     */
    async changePath(kwargs) {
        const folder = kwargs.folder;
        let flush_redo_stack = kwargs.flush_redo_stack;
        let add_to_parents = kwargs.add_to_parents;

        if (folder === undefined) {
            console.error("changePath must be given a path");
            return;
        }
        
        if (flush_redo_stack === undefined) {
            // Set default
            flush_redo_stack = true;
        }

        if (add_to_parents === undefined) {
            // Set default
            add_to_parents = true;
        }


        if (this.cashe[folder] !== undefined) {
            // Update the browser with the cashed folders and files
            this.folders = this.cashe[folder].folders
            this.files = this.cashe[folder].files
            this.path = folder

            this.setState({
                path: this.path
            })

            // Redo button should not add to parents
            if (add_to_parents) {
                this.parents.push(this.path);
            }
            
            // redo_stack should be flushed if this method isn't being called by goBack or goForward methods
            if (flush_redo_stack) {
                this.redo_stack = [];
            }

            // Fill in the path link with the new path
            document.getElementById("s3-link").value = this.path;

            return true
        }

        try {
            // Call the backend to get the folder's children folders and files
            let response = await this.QASM.call_backend(window, function_names.OPEN_S3_FOLDER, folder);

            // Update the browser's folders, files, and path
            this.folders = response.folders;
            this.files = response.files;
            this.path = folder;
            
            this.setState({
                path: this.path
            });

            // Add the folders and files to the cashe so we don't have to call the backend again for this folder
            this.addToCache(folder, this.folders, this.files);

            // redo_stack should be flushed if this method isn't being called by goBack or goForward methods
            if (flush_redo_stack) {
                this.redo_stack = [];
            }

            // Redo button should not add to parents
            if (add_to_parents) {
                this.parents.push(this.path);
            }
            
            // Fill in the path link with the new path
            document.getElementById("s3-link").value = this.path;
    
            console.log("Finished changing path")
            return true
        } catch {
            console.log("Failed to load " + folder);
            return false
        }
    }


    /**
     * Go up one folder level and populate the folders and files.
     */
    async goBack() {
        // Add the current folder to the redo stack
        this.redo_stack.push(this.path);

        let folder = this.parents.pop();
        if (this.parents.length > 0) {
            folder += folder.endsWith("/") ? "" : "/" // Add trailing slash if not present
        }
        
        // Change the path and record if the change was successful
        let success = this.changePath({
            "folder": folder,
            "flush_redo_stack": false,
            "add_to_parents": false
        })

        // If changing the path wasn't successful then we need to undo the changes we made to
        // the undo and parents stack
        if (!success) {
            this.redo_stack.pop();
            this.parents.push(folder)
        }
    }

    /**
     * Navigates to the folder on the top of the redo_stack.
     */
    goForward() {
        this.changePath({
            "folder": this.redo_stack.pop(),
            "flush_redo_stack": false,
            "add_to_parents": true
        })
    }


    /**
     * @param {string[]} path_array Array of all the S3 folder path segments
     * @param {string} final_segment The final S3 folder path segment
     */
    async getFolders(path_array, final_segment) {
        try {
            // Create a variable to hold the final path
            let final_path = "";

            // Loop through the path array. Add to the final path until you get to the final segment
            for (let path in path_array) {
                if (path === final_segment) {
                    final_path = final_path + path;
                    break;
                }
                else {
                    final_path = final_path + path + "/";
                }
            }

            // Get all the contents of the folder and return all the folders it contains
            const response = await this.QASM.call_backend(window, "openS3folder", final_path);
            console.log(response.folders, "response.folders");
            return response.folders;
        }
        catch {
            console.log("Failed to get folders")
            return [];
        }
    }


    /**
     * Checks which mode and size are currently selected. If the radio
     * buttons haven't loaded in yet, then the querySelector will be null
     * and we use the default of grid medium.
     * 
     * @returns {string} Display mode and size as string
     */
    getDisplayMode() {
        let style, size;

        if (document.querySelector("input[name='display']:checked") === null) {
            style = "grid";  // Default
        }
        else {
            // Currently checked display style radio button
            style = document.querySelector("input[name='display']:checked").value;
        }

        if (document.querySelector("input[name='display-size']:checked") === null) {
            size = "medium"; // Default
        }
        else {
            // Currently checked size radio button
            size = document.querySelector("input[name='display-size']:checked").value;
        }

        return style + " " + size;
    }


    /**
     * Updates the class on the div that holds all of the s3 stuff.
     */
    updateDisplayMode() {
        document.getElementById("s3-item-holder").className = this.getDisplayMode();
    }

    /**
     * Call the backend to get all the children of each folder along a path
     * 
     * @returns {string[][]} Returns an array of string arrays. Each string array contains all of the children of a folder segment
     */
    async getPathSegmentsChildren() {
        const data = await this.QASM.call_backend(window, function_names.GET_CASCADING_DIR_CHILDREN, this.path);
        return data.data;
    }


    async createPath(final_segment, depth, cascade=false) {
        // If the depth is negative, route to the root folder
        if (depth === -1) {
            this.changePath({"folder": ""});
            return
        }

        // Grab a list of all path segments and convert it from a nodelist to an array
        let path_segments = Array.from(document.querySelectorAll(".segment-name"));

        // Remove the first segment because its actually the bucket name
        path_segments.shift()

        // Create a path up to a specified depth
        let path = "";
        for (let idx = 0; idx < depth; idx++) {
            path += path_segments[idx].innerText + "/";
        }

        // Add the final segment
        path += final_segment + "/"

        // if cascade is true, add the rest of the path segments as well
        if (cascade) {
            let cascaded_path = path;
            for (let idx = depth + 1; idx < path_segments.length; idx++) {
                cascaded_path += path_segments[idx].innerText + "/";
            }

            const response = await this.QASM.call_backend(window, function_names.OPEN_S3_FOLDER, cascaded_path);
            const folders = response.folders;
            const files = response.files;

            // Check if making the cascaded path results in a valid folder
            if (folders.length !== 0 || files.length !== 0) {
                this.changePath({"folder": cascaded_path})
                return
            }
        }

        // Navigate to path
        this.changePath({"folder": path})
    }

    /**
     * Handles key presses when focus is on the s3path input.
     * 
     * @param {string} key String saying what key was pressed
     */
    handleKeyPress(key) {
        if (key !== "Enter") return

        this.readS3Link()
    }

    /**
     * Ask the user if they want to close the window. If they say yes, then close the window.
     */
    closeWindow() {
        if (confirm("Do you want to close the browser without selecting anything?")) {
            window.close()
        }
    }
       
    
    addToCache(base_folder, folders, files) {
        this.cashe[base_folder] = {};

        this.cashe[base_folder]["folders"] = folders
        this.cashe[base_folder]["files"] = files
    }


    /**
     * 
     * @param {string} path Should be an s3path structured like so "root/folder1/folder2/file" or "root/folder1/folder2/"
     * @returns {string[]} An array of each segment in a path. ["root", "folder1", "folder2", "file"]
     */
    getPathSegments(path) {
        // If the path is an empty string return an empty array
        if (path === "") {
            return [];
        }

        // Check if the final character is a /. If it is remove it. Otherwise the path stays the same
        path = path.charAt(path.length - 1) === "/" ? path.slice(0, -1) : path;

        // Return an array where the string was split at each /
        return path.split("/");
    }


    /**
     * Given a path, this will return an array of each path along the path. For example "root/folder1/folder2/file"
     * would return ["root/", "root/folder1/", "root/folder1/folder2/", "root/folder1/folder2/file"]
     * 
     * @param {string} path 
     * @return {string[]} 
     */
    buildPaths(path) {
        // Get an array of each segment
        const path_segments = this.getPathSegments(path)

        let paths = []

        for ( let idx = 0; idx < path_segments.length; idx++ ) {
            if ( idx === 0 ) {
                paths.push(path_segments[0] + "/")
            }
            else {
                paths.push(paths[idx - 1] + path_segments[idx] + "/")
            }
        }
        return paths
    }


    getNavigationInfo() {
        let navigation_info = []
        const path_segments = this.getPathSegments(this.path);
        const full_path_segments = this.buildPaths(this.path);
        
        try {
            // The bucket will always be displayed, so add that first.
            navigation_info.push({
                "name": "",
                "folders": this.cashe[""].folders,
                "files": this.cashe[""].files
            })

            // Add the rest of the segments
            for ( let idx = 0; idx < full_path_segments.length; idx++ ) {
                navigation_info.push({
                    "name": path_segments[idx],
                    "folders": this.cashe[full_path_segments[idx]].folders,
                    "files": this.cashe[full_path_segments[idx]].files
                })
            }
        } 
        catch {
            console.log("getNavInfo Failed")
        }
        return navigation_info
    }


    render() {
        return (
            <div className="S3Browser">
                <h2>S3 Browser: {this.QASM.s3_bucket}</h2>
                <header>
                    <div className="options">
                        <fieldset className="directory-display-mode" onChange={this.updateDisplayMode}>
                            <legend>Display</legend>
                            <div>
                                <input type="radio" id="grid-display" name="display" value="grid" defaultChecked />
                                <label htmlFor="grid-display">Grid</label>
                            </div>
                            <div>
                                <input type="radio" id="list-display" name="display" value="list" />
                                <label htmlFor="list-display">List</label>
                            </div>
                        </fieldset>
                        <fieldset className="directory-display-size" onChange={this.updateDisplayMode}>
                            <legend>Size</legend>
                            <div>
                                <input type="radio" id="display-small" name="display-size" value="small" />
                                <label htmlFor="display-small">Small</label>
                            </div>
                            <div>
                                <input type="radio" id="display-medium" name="display-size" value="medium" defaultChecked />
                                <label htmlFor="display-medium">Medium</label>
                            </div>
                            <div>
                                <input type="radio" id="display-large" name="display-size" value="large" />
                                <label htmlFor="display-large">Large</label>
                            </div>
                        </fieldset>
                        <div className="cascade">
                            <input type="checkbox" id="cascade-checkbox"/>
                            <label
                                htmlFor="cascade-checkbox">
                                Cascade
                            </label>
                        </div>
                    </div>
                    <div className="path-display">
                        <div className="nav-buttons">
                            <button 
                                className={this.parents.length !== 0 ? "nav-button not-disabled-button" : "nav-button disabled-button"}
                                onClick={this.goBack} 
                                disabled={this.parents.length == 0 ? true : undefined}>
                                ⮨
                            </button>
                            <button 
                                className="nav-button"
                                onClick={this.goForward}
                                disabled={this.redo_stack.length == 0 ? true : undefined}>
                                ⮩
                            </button>
                        </div>
                        <div className="path-display-inner">
                            {this.path_segments_children.length >= 1 && 
                                this.getNavigationInfo().map((segment, index) => (
                                    <div className="path-segment" key={segment.name}>
                                        <button 
                                            className="segment-name"
                                            onClick={() => this.createPath(segment.name, index - 1)}>
                                            {segment.name === "" ? this.QASM.s3_bucket : segment.name}
                                        </button>
                                            {segment.folders.length !== 0 &&
                                                <Dropdown
                                                    items={segment.folders}
                                                    callback={(segment) => this.createPath(
                                                        segment, 
                                                        index, 
                                                        document.querySelector('#cascade-checkbox').checked
                                                    )}
                                                />
                                            }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </header>
                <div className={this.getDisplayMode() + " content"} id="s3-item-holder">
                    {this.folders.map(folder_name => (
                        <div onClick={e => this.changePath({"folder": folder_name})} key={folder_name} className="clickable">
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
                <div className="footer">
                    {(this.mode === s3_browser_modes.SAVE_JSON || this.mode === s3_browser_modes.SAVE_IMAGE) && 
                        <div className="new-filename-container">
                            <label htmlFor="new-filename">
                                New Filename: 
                            </label>
                            <input
                                id="new-filename"
                                type="text"
                                onKeyDown={(e) => this.handleKeyPress(e.key)}
                            />
                        </div>
                    }
                    <div className="main-footer-content">
                        <label htmlFor="s3-link">
                            Folder:
                        </label>
                        <input
                            id="s3-link"
                            type="text"
                            onKeyDown={(e) => this.handleKeyPress(e.key)}
                        />
                        {this.mode === s3_browser_modes.SELECT_DIRECTORY && 
                            <button
                                onClick={this.selectFolder}
                                className="select-button button">
                                Select Current Directory
                            </button>
                        }
                        {(this.mode === s3_browser_modes.SAVE_JSON || this.mode === s3_browser_modes.SAVE_IMAGE) &&
                            <button
                                onClick={() => this.createFile(this.mode)}
                                className="button">
                                Save New File Here
                            </button>
                        }
                        <button 
                            className="button"
                            onClick={this.closeWindow}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )
    }


    async componentDidMount() { 
        try {
            this.path_segments_children = await this.getPathSegmentsChildren();
            // Update cache
            this.cashe[""] = {
                "folders": this.folders,
                "files": this.files
            }
            this.forceUpdate();
        } catch(error) {
            console.error(error);
        }
    }
}

export default S3Browser;