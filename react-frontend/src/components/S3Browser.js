import { Component } from 'react';
import Dropdown from "./Dropdown.js";
import S3Folder from "./S3Folder.js";
import S3File from "./S3File.js";
import "../css/S3Browser.css";
const { image_types, function_names } = require("../../public/electron_constants.js");
const { s3_browser_modes } = require("../QASM/constants.js");
const BASE_PATH = ""

class S3Browser extends Component {
    component_updater = 0;
    redo_stack = [];
    cached_folder_structure = {};

    constructor(props) {
        super(props);
        
        this.QASM    = props.QASM
        this.mode    = window.S3_BROWSER_MODE // Set by window opener
        this.path    = window.START_FOLDER
        this.parents = props.parents || [] // Stack of parent folders
        
        if (this.path == null) { // Starting at bucket level
            this.path = BASE_PATH
            this.folders = this.QASM.folders
            this.files   = this.QASM.files
            this.cache = {
                [this.path]: {
                    "folders": this.folders,
                    "files": this.files
                }
            }
        } else { // Starting at some folder depth
            this.setS3Path(this.path);
        }

        this.state = {
            path: this.path
        };

        // Load user display settings
        this.loadSettings()
        

        // Bind functions
        this.selectFolder         = this.selectFolder.bind(this);
        this.changePath           = this.changePath.bind(this);
        this.goBack               = this.goBack.bind(this);
        this.getFolders           = this.getFolders.bind(this);
        this.selectFile           = this.selectFile.bind(this);
        this.createFile           = this.createFile.bind(this);
        this.getDisplayMode       = this.getDisplayMode.bind(this);
        this.updateDisplayMode    = this.updateDisplayMode.bind(this);
        this.setS3Path            = this.setS3Path.bind(this);
        this.readS3Link           = this.readS3Link.bind(this);
        this.createPath           = this.createPath.bind(this);
        this.handleKeyPress       = this.handleKeyPress.bind(this);
        this.goForward            = this.goForward.bind(this);
        this.addCache             = this.addToCache.bind(this)
        this.getNavigationInfo    = this.getNavigationInfo.bind(this);
        this.addCascadeDirToCache = this.addCascadeDirToCache.bind(this);
        this.saveSettings         = this.saveSettings.bind(this);
        this.loadSettings         = this.loadSettings.bind(this);
    }


    /**
     * Change the current location to be at the given s3 path.
     * 
     * @param {string} path s3 path
     */
    setS3Path(path) {
        this.path = path;
        this.folders = [];
        this.files = [];

        // Populate parent stack
        this.parents = [BASE_PATH];
        let folders = path.split("/").slice(0, -2);
        for (let i=0; i < folders.length; i++) {
            this.parents.push(this.parents[i] + folders[i] + "/");
        }
        
        this.changePath(path).then(() => {
            this.parents.pop(); // Remove starting path from parent stack

            // Call the backend to get each successive folder's child folders and files to populate the header
            let promise = Promise.resolve(this.QASM.call_backend(window, function_names.GET_CASCADING_DIR_CHILDREN, path));

            // When the backend call resolves add the folder data to the cache so the header can display it
            promise.then((data) => {
                // Add data to the cache
                this.addCascadeDirToCache(data.data)

                // Force an update so that the header loads with the new data
                this.forceUpdate();
            }).catch((error) => {
                console.error("Couldn't recieve folder data", error)
            })
        });
    }


    /**
     * Check that current folder has images, then send folder path to the main window.
     */
    selectFolder() {
        // Verify presence of images in folder
        if (this.mode === s3_browser_modes.SELECT_IMG_DIRECTORY) {
            let images_present = false;
            for (let file of this.files) {
                let ext = file.split('.').pop()
                if (ext in image_types) {
                    images_present = true;
                    break;
                }
            }
            
            if (!images_present) {
                alert("No images found in folder " + this.path);
                return;
            }
        }

        let data = {
            success: true,
            path: this.path,
        }
        // Send data back to parent window
        window.opener.postMessage(data, '*');
        window.close();
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

        const new_filename_input = document.getElementById("new-filename");
        let new_filename = new_filename_input.value;

        // Make sure the filename isn't blank
        if (new_filename === "") {
            // TODO: Show an alert if the user trys to save without a filename
            // The built-in javascript alert() was causing a weird bug with electron
            console.warn("No filename provided");
            new_filename_input.focus();
            return;
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

            // Check to see if this path is already in the cache
            if (this.cache[link] !== undefined) {
                // If it is we can assume that the paths leading up to it are also probably in the cache
                this.setS3Path(link);
            }
            else {
                // Call the backend to get all of the missing folder data
                let promise = Promise.resolve(this.QASM.call_backend(window, function_names.GET_CASCADING_DIR_CHILDREN, link))

                // Set the path anyway
                this.setS3Path(link)

                // When the backend call resolves add the folder data to the cache so the header can display it
                promise.then((data) => {
                    // Add data to the cache
                    this.addCascadeDirToCache(data.data)

                    // Force an update so that the header loads with the new data
                    this.forceUpdate();
                }).catch((error) => {
                    console.error("Couldn't recieve folder data", error)
                })
            }
        }
    }


    /**
     * Adds data recieved from QASM.call_backend(window, function_names.GET_CASCADING_DIR_CHILDREN, link) to 
     * the cache.
     * 
     * @param data [{name: string, files: string[], folders: string[]}, ... ]
     */
    addCascadeDirToCache(data) {
        // The names in the data object are only their reletive name, while the cache requires the full path name, so 
        // create a variable to hold the path info.
        let previous_folder = "";

        // let idx = 1. This is because the first element of data will always be the root folder which will always
        // be populated by this point
        for ( let idx = 1; idx < data.length; idx++ ) {
            // Create the full path name from the previous folder name
            let current_folder = previous_folder + data[idx].name + "/";

            // Add this folder's folders and files to the cache
            this.addToCache(current_folder, data[idx].folders, data[idx].files);

            previous_folder = current_folder
        }
    }


    /**
     * Navigates to a given s3 folder.
     * 
     * @param {string} folder String of the path for the folder we want to navigate to
     * @returns {boolean} Returns true if the change succeeded, returns false if the change failed
     */
    async setFolder(folder) {
        // First check if this folder has been saved in the cache
        if (this.cache[folder] !== undefined) {
            // Update the browser with the cached folders and files
            this.folders = this.cache[folder].folders;
            this.files = this.cache[folder].files;
            this.path = folder;

            this.setState({
                path: this.path
            });
        }
        // If the cache is undefined then try to get the information from the backend
        else {
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

                // Add the folders and files to the cache so we don't have to call the backend again for this folder
                this.addToCache(folder, this.folders, this.files);
            } 
            catch {
                // setFolder failed
                console.log("Failed to load " + folder);

                return false
            }
        }
        // Fill in the path link with the new path
        document.getElementById("s3-link").value = this.path;
        
        // setFolder succeeded
        return true;
    }


    /**
     * Changes the active path to a new folder and populate its folders and files.
     * 
     * @param {string} folder String of what folder we want to navigate to
     */
    async changePath(folder) {
        // Get the current path and save it since setFolder will change what this.path is
        const current_path = this.path;

        // Try to setFolder with the given folder
        const success = this.setFolder(folder)

        // If changing the folder was a success, then handle updating the parents and redo stack
        if (success) {
            // Add the folder we just navigated away from to the top of the the parents stack
            this.parents.push(current_path);

            // Reset the redo stack;
            this.redo_stack = [];
        }
    }


    /**
     * Navigate to the folder on top of the parents stack.
     */
    goBack() {
        // Get the folder we'll be navigating to from the top of the parents stack
        const new_path = this.parents.pop();
        
        // Get the current path and save it since setFolder will change what this.path is
        const current_path = this.path;

        // Try to set the folder
        const success = this.setFolder(new_path);

        // If the change was successful then add the folder we navigated away from to the redo stack
        if (success) {
            this.redo_stack.push(current_path);
        }
        // If the change failed, then add the folder we tried to navigate to back to the parents stack
        else {
            this.parents.push(new_path);
        }
    }


    /**
     * Navigates to the folder on top of the redo_stack.
     */
    goForward() {
        // Get the folder we'll be navigating to from the top of the redo stack
        const new_path = this.redo_stack.pop();

        // Get the current path and save it since setFolder will change what this.path is
        const current_path = this.path;

        // Try to set the folder  
        const success = this.setFolder(new_path);

        // If the change was successful then add the folder we navigated away from to the redo stack
        if (success) {
            this.parents.push(current_path);
        }
        // If the change failed, then add the folder we tried to navigate to back to the redo stack
        else {
            this.redo_stack.push(new_path);
        }
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

        // Save the new settings
        this.saveSettings();
    }

    /**
     * Creates the full path string to navigate to when navigating with the header buttons. If cascade is true,
     * it will try to create a valid path with just the final_segment being replaced. If it can't create a valid
     * path, then it will create a path without cascading.
     * 
     * @param {string} final_segment The final segment in the path being created
     * @param {number} depth The depth in the path the final segment is
     * @param {boolean} cascade Whether or not to cascade to the same depth as the current folder
     */
    async createPath(final_segment, depth, cascade=false) {
        // If the depth is negative, route to the root folder
        if (depth === -1) {
            this.changePath(BASE_PATH);
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
                this.changePath(cascaded_path);

                // If the cascaded path is undefined in the cache, then that means that we have to call the backend to fill
                // in missing folder data
                if (this.cache[cascaded_path] === undefined) {
                    // Ask the backend for the folder data
                    let promise = Promise.resolve(this.QASM.call_backend(window, function_names.GET_CASCADING_DIR_CHILDREN, cascaded_path));
        
                    // When the backend call resolves add the folder data to the cache so the header can dispaly it
                    promise.then((data) => {
                        // Add data to the cache
                        this.addCascadeDirTocache(data.data);
        
                        // Force an update so that the header loads with the new data
                        this.forceUpdate();
                    }).catch((error) => {
                        console.error("Couldn't recieve folder data", error);
                    })
                }
                return;
            }
        }

        // Navigate to path
        this.changePath(path);
    }


    /**
     * Handles key presses when focus is on the s3path input.
     * 
     * @param {string} key String saying what key was pressed
     */
    handleKeyPress(key) {
        if (key !== "Enter") return;

        this.readS3Link();
    }


    /**
     * Ask the user if they want to close the window. If they say yes, then close the window.
     */
    closeWindow() {
        if (confirm("Do you want to close the browser without selecting anything?")) {
            window.close()
        }
    }


    /**
     * Uses the base folder as a key to add the folders and files to the cache.
     * 
     * @param {string} base_folder Parent folder name
     * @param {string[]} folders Array of children folders
     * @param {string[]} files Array of children files
     */
    addToCache(base_folder, folders, files) {
        this.cache[base_folder] = {};

        this.cache[base_folder]["folders"] = folders;
        this.cache[base_folder]["files"] = files;
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
        const path_segments = this.getPathSegments(path);

        let paths = [];

        for ( let idx = 0; idx < path_segments.length; idx++ ) {
            if ( idx === 0 ) {
                paths.push(path_segments[0] + "/");
            }
            else {
                paths.push(paths[idx - 1] + path_segments[idx] + "/");
            }
        }
        return paths;
    }

    /**
     * Builds and returns an array of objects that contains the name, child files, and child folders
     * of each successive segment to the current folder.
     * 
     * @returns [{name: string}, files: string[], folders: string[]}, ... ] for each segment in the heading nav bar
     */
    getNavigationInfo() {
        let navigation_info = [];
        const path_segments = this.getPathSegments(this.path);
        const full_path_segments = this.buildPaths(this.path);
        
        try {
            console.log(JSON.parse(JSON.stringify(this.cache)), "cache")
            // The bucket will always be displayed, so add that first.
            navigation_info.push({
                "name": BASE_PATH,
                "folders": this.cache[BASE_PATH].folders.map(folder => folder.slice(0, -1)), // Remove the final character
                "files": this.cache[BASE_PATH].files
            })

            // Add the rest of the segments
            for ( let idx = 0; idx < full_path_segments.length; idx++ ) {
                navigation_info.push({
                    "name": path_segments[idx],
                    "folders": this.cache[full_path_segments[idx]].folders.map(folder => {
                        const segments = folder.split("/");
                        return segments[segments.length - 2];
                    }),
                    "files": this.cache[full_path_segments[idx]].files.map(file => {
                        const segments = file.split("/");
                        return segments[segments.length - 1];
                    })
                })
            }
        } 
        catch {
            console.log("getNavInfo Failed");
        }
        return navigation_info;
    }


    /**
     * Saves the user settings on local storage so that diffrent S3Browser instances will have 
     * the same settings for the same user.
     */
    saveSettings() {
        const settings = {
            "cascade": document.querySelector('#cascade-checkbox').checked,
            "display": document.querySelector("input[name='display']:checked").value,
            "size": document.querySelector("input[name='display-size']:checked").value
        }

        window.localStorage.setItem('settings', JSON.stringify(settings));
    }


    /**
     * Loads the user settings from local storage.
     */
    loadSettings() {
        this.settings = JSON.parse(window.localStorage.getItem('settings'));

        // If the user settings are null set defaults
        if (this.settings === null) {
            this.settings = {
                "cascade": false,
                "display": "grid",
                "size": "medium"
            }
        }
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
                                <input 
                                    type="radio" 
                                    id="grid-display" 
                                    name="display" 
                                    value="grid" 
                                    defaultChecked={this.settings.display==="grid"} />
                                <label htmlFor="grid-display">Grid</label>
                            </div>
                            <div>
                                <input 
                                    type="radio" 
                                    id="list-display" 
                                    name="display" 
                                    value="list" 
                                    defaultChecked={this.settings.display==="list"} />
                                <label htmlFor="list-display">List</label>
                            </div>
                        </fieldset>
                        <fieldset className="directory-display-size" onChange={this.updateDisplayMode}>
                            <legend>Size</legend>
                            <div>
                                <input 
                                    type="radio" 
                                    id="display-small" 
                                    name="display-size" 
                                    value="small" 
                                    defaultChecked={this.settings.size==="small"} />
                                <label htmlFor="display-small">Small</label>
                            </div>
                            <div>
                                <input 
                                    type="radio" 
                                    id="display-medium" 
                                    name="display-size" 
                                    value="medium" 
                                    defaultChecked={this.settings.size==="medium"} />
                                <label htmlFor="display-medium">Medium</label>
                            </div>
                            <div>
                                <input 
                                    type="radio" 
                                    id="display-large" 
                                    name="display-size" 
                                    value="large" 
                                    defaultChecked={this.settings.size==="large"} />
                                <label htmlFor="display-large">Large</label>
                            </div>
                        </fieldset>
                        <div className="cascade">
                            <input 
                                type="checkbox" 
                                id="cascade-checkbox" 
                                onChange={this.saveSettings} 
                                defaultChecked={this.settings.cascade}/>
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
                            {this.getNavigationInfo().map((segment, index) => (
                                <div className="path-segment" key={segment.name}>
                                    <button 
                                        className="segment-name"
                                        onClick={() => this.createPath(segment.name, index - 1)}>
                                        {segment.name === BASE_PATH ? this.QASM.s3_bucket : segment.name}
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
                            ))}
                        </div>
                    </div>
                </header>
                <div className={this.getDisplayMode() + " content"} id="s3-item-holder">
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


    // async componentDidMount() { 
    //     try {
    //         // Update cache
    //         this.cache[""] = {
    //             "folders": this.folders,
    //             "files": this.files
    //         }
    //         this.forceUpdate();
    //     } catch(error) {
    //         console.error(error);
    //     }
    // }
}

export default S3Browser;