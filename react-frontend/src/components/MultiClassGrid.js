// Grid labeler that supports multiple classes via checkboxes
import { Component, Fragment } from 'react';
import MultiClassGridImage from "./MultiClassGridImage.js";
import Dropdown from './Dropdown.js';
import "../css/Grid.css";
// import "../css/MultiClassGrid.css";
const { update_all_overlays, getOneFolderUp, getCurrentFolder } = require("../QASM/utils.js");
const { autoScroll, changeGridWidth, toggleImageHidden, changeImage, loadImages, initLabels, loadLabels, saveLabels, autoLoadLabels } = require("../QASM/grid_utils.js");
const { function_names } = require("../../public/electron_constants.js");

// TODO: Combine this with Grid, and/or add to app as a seperate component. 
// TODO: Move functions common w/Grid to a utils file

const FILTER_MODES = {
    "no_filter": "no filter",
    // "group_by_class": "group by class", // Not supported for multi-class
}

class MultiClassGrid extends Component {
    images = {};
    image_names = [];
    grid_width = 1;
    grid_image_names = [];
    src = "";
    classes = {}; // {<string class_type>: {"selector_type": <string>, "class_values": [<string>], "default": <string> }}
    class_types = [];
    component_updater = 0;
    image_stack = [];
    hover_image_id = null;
    images_shown = false;
    update_success = false;
    allow_next_scroll = false;
    filtered_class_type = FILTER_MODES.no_filter; // high level 
    filtered_class_values = []; // selected value within a class type
    filtered_class_checkbox_values = []; // checkbox values for the current filtered class values
    label_savenames = undefined; // {<string button_name>: <string savename>, ...}
    label_loadnames = undefined; // [<string loadname1>, <string loadname2>, ...]
    image_layer_folder_names = undefined; // [Array[<string>], ...]
    // Store the folder names in all the directories we've loaded
    next_dir_cache = {}; // [<string root_folder_name>: Array[<string foldernames>]]

    constructor(props) {
        super(props);

        // Initialize props
        this.QASM = props.QASM;
        this.grid_width = props.grid_width || 1;
        this.classes = props.classes;
        this.label_savenames = props.label_savenames || undefined;
        this.label_loadnames = props.label_loadnames || undefined;
        this.autoload_labels_on_dir_select = props.autoload_labels_on_dir_select || false;
        this.image_layer_folder_names = props.image_layer_folder_names || undefined;

        this.class_types = Object.keys(this.classes); // For easy access
        this.labels = initLabels(this);
        this.state = {
            labels: this.labels,
            src: this.src,
        };


        // Attach event listeners
        this.initEventListeners();

        // Hack for dev
        this.src = "Foundation Field 2 (Dennis Zuber)/Videos/7-08/Row 1, 16/3840x2160@120fps/Pass A/DS Splits/DS 000/bottom Raw Images/"
        this.loadImageDir();

        // Bind functions
        this.clearAll = this.clearAll.bind(this);
        this.selectImageDir = this.selectImageDir.bind(this);
        this.updateState = this.updateState.bind(this);
        this.updateLocalLabels = this.updateLocalLabels.bind(this);
        this.addImageLayer = this.addImageLayer.bind(this);
        this.getImageStackByName = this.getImageStackByName.bind(this);
        this.initEventListeners = this.initEventListeners.bind(this);
        this.changeAutoLoadOnDirSelect = this.changeAutoLoadOnDirSelect.bind(this);
        this.autoLoadImageLayers = this.autoLoadImageLayers.bind(this);
        this.loadImageDir = this.loadImageDir.bind(this);
        this.loadNextDir = this.loadNextDir.bind(this);
        this.filterImages = this.filterImages.bind(this);
    }


    /**
     * Attach event listeners to the page.
     */
    initEventListeners() {
        // Update the overlays whenever the page size is changed
        window.addEventListener("resize", update_all_overlays);

        // Update which image is currently being hovered
        document.addEventListener("mousemove", (e) => {
            if (e.target.className.includes("hover-target")) {
                // Every single hover-target will be inside of a div that's 
                // inside of a div, that has the id that we're trying to select.
                this.hover_image_id = e.target.parentNode.parentNode.id;
            } else {
                this.hover_image_id = null;
            }
        });

        // Prevent weird behavior when scrolling
        window.addEventListener("scroll", () => {
            if (this.allow_next_scroll) {
                this.allow_next_scroll = false;
            } else {
                this.hover_image_id = null;
            }
        });

        // Keybinds
        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                saveLabels(window, this);
            }

            if (this.hover_image_id !== null && e.key === "b") {
                changeImage(document, this.hover_image_id);
            }

            if (this.hover_image_id !== null) {
                // n for next, h for previous
                autoScroll(this, this.hover_image_id, e.key);
            }
        });
    }


    /**
     * Update the state variables and force
     * the page to update.
     */
    updateState() {
        this.setState({
            labels: this.labels,
            src: this.src,
        });

        // Force page to update
        this.component_updater++;
    }


    /**
     * Scrape the page for all the current labels
     */
    updateLocalLabels() {
        // Get state of each GridImage
        this.labels = initLabels(this); // Gen new object w/datetime
        for (let i = 0; i < this.image_names.length; i++) {
            let image_name = this.image_names[i];
            if (this.labels[image_name] === undefined) { this.labels[image_name] = {}; }
            Object.keys(this.classes).map(class_type => (
                this.classes[class_type].class_values.map(class_val => {
                    if (document.getElementById(image_name + "_" + class_val).checked) {

                        this.labels[image_name][class_type] = class_val;
                    }
                    else if (this.labels[image_name] === class_val) {
                        delete this.labels[image_name][class_type];
                    }
                    return null;
                }
                )
            ))

        }
    }


    /**
     * Clear all the current labels
     */
    clearAll() {
        // Set all classes to the default
        this.labels = initLabels(this);
        this.updateState();
    }


    /**
     * Open a directory selection dialog and 
     * load in all the images.
     */
    async selectImageDir() {
        let dir_path = await this.QASM.call_backend(window, function_names.OPEN_DIR, this.src);
        if (dir_path !== undefined) {
            this.src = dir_path;
            await this.loadImageDir();
        } else {
            console.log("Prevented loading invalid directory.");
        }
    }


    /**
     * Load images from the current source directory,
     * and try and autoload labels and image layers.
     */
    async loadImageDir() {
        if (this.src !== undefined) {
            this.image_stack = []; // Clear image stack on new directory load
            if (this.autoload_labels_on_dir_select) {
                autoLoadLabels(window, this); // Try and autoload labels
            }
            this.autoLoadImageLayers(); // Try and autoload image layers
            await loadImages(window, this); // Load images
            this.updateState();
        }
    }


    /**
     * Load the next directory
     *  
     */
    async loadNextDir() {
        let current_folder = getCurrentFolder(this.src); // Current folder name, without full path
        let current_dir = getOneFolderUp(this.src); // One folder up
        let root_dir = getOneFolderUp(getOneFolderUp(this.src)); // Two folders up

        let folders;
        if (root_dir in this.next_dir_cache) {
            // If we have folder info cached, use it
            folders = this.next_dir_cache[root_dir]
        } else {
            // Else get all folders in root_dir and add to cache
            let response = await this.QASM.call_backend(window, function_names.OPEN_S3_FOLDER, root_dir);
            folders = response.folders.sort();
            this.next_dir_cache[root_dir] = folders;
            console.log("Caching folders in ", root_dir);
        }
        

        // Get index of current folder
        let current_folder_idx = folders.indexOf(current_dir);
        if (current_folder_idx + 1 === folders.length) {
            alert("No more directories to load.");
            return;
        } else {
            // Start at the next dir in root_dir, with the same current image folder name
            this.src = folders[current_folder_idx + 1] + current_folder + "/";
            await this.loadImageDir();
        }
    }


    /**
     * Prompt user to select a directory
     * and push all the images onto the image stack
     */
    async addImageLayer() {
        // Prompt user to select directory
        let dir_path = await this.QASM.call_backend(window, function_names.OPEN_DIR, this.src);
        console.log(dir_path);

        // Load images and add them to the image stack
        let image_layer = await this.QASM.call_backend(window, function_names.LOAD_IMAGES, dir_path);
        if (Object.keys(image_layer).length === 0) {
            console.log("Prevent adding empty layer.");
        } else {
            this.image_stack.push(image_layer);
            console.log(this.image_stack);
        }
        this.updateState();
    }


    /**
     * Try and auto-load image layers if we have image_layer_folder_names
     */
    async autoLoadImageLayers() {
        if (this.image_layer_folder_names !== undefined) {
            let root_dir = getOneFolderUp(this.src);
            let current_folder = getCurrentFolder(this.src)
            let n_layers = this.image_layer_folder_names[0].length; // Number of layers to load
            for (let folder_name_group of this.image_layer_folder_names) {
                // Try each group of folder names in order, skipping
                // any that result in empty layers
                for (let folder_name of folder_name_group) {
                    // Don't add current folder as a layer
                    if (folder_name === current_folder) {
                        n_layers--; // We need one fewer layer
                    } else {
                        // Load images and add them to the image stack
                        let image_layer = await this.QASM.call_backend(window, function_names.LOAD_IMAGES, root_dir + folder_name + "/");
                        if (Object.keys(image_layer).length === 0) {
                            console.log("Prevent adding empty layer, skipping to next folder group.");
                            this.image_stack = []; // Clear image stack to allow next group to try and load
                            n_layers = this.image_layer_folder_names[0].length; // Reset n_layers
                            break;
                        } else {
                            this.image_stack.push(image_layer);
                        }
                        console.log(this.image_stack);
                    }
                }
                // If we have the correct number of layers, we're done
                if (this.image_stack.length === n_layers) {
                    break;
                }
            }

            this.updateState();
        }
    }


    /**
     * Change the filtered class value and put it at the top
     * 
     * @param {string} class_value 
     *  
     */
     changeGridFilter(class_value, checked) {
        if (checked) {
            // Add to filtered class values
            if (!this.filtered_class_values.includes(class_value)) {
                this.filtered_class_values.push(class_value);
            }
        } else {
            // Remove from filtered class values
            this.filtered_class_values.splice(this.filtered_class_values.indexOf(class_value), 1);
        }
        // Store checkbox value
        this.filtered_class_checkbox_values[class_value] = checked;
        this.updateLocalLabels(); // Update current labels
        this.filterImages();
    }


    /**
     * Set this.filtered_class_type as class_type
     * 
     * @param {string} class_type 
     */
    changeFilteredClassType(class_type) {
        this.filtered_class_type = class_type;
        if (this.class_types.includes(class_type)) {
            // Reset filtered class checkbox values to start unchecked
            this.filtered_class_checkbox_values = {}
            for (let class_value of this.classes[this.filtered_class_type].class_values) {
                this.filtered_class_checkbox_values[class_value] = false;
            }
        }
        this.updateLocalLabels();
        this.updateState();
    }


    filterImages() {
        // Toggle hidden class on images that don't match the filter
        for (let image_name of this.image_names) {
            switch (this.filtered_class_type) {
                case FILTER_MODES.no_filter:
                    // Show all images
                    toggleImageHidden(document, image_name, false);
                    break;
                default:
                    // If the filtered_class_values array is empty, show all images
                    if (this.filtered_class_values.length === 0) {
                        toggleImageHidden(document, image_name, false);
                    } else if (
                        !(image_name in this.labels) || // Hide images with no labels
                        !(this.filtered_class_values.includes(this.labels[image_name][this.filtered_class_type])) // Hide images that don't match any filtered class value
                    ) {
                        // Hide images that don't match the filter
                        toggleImageHidden(document, image_name, true);
                    } else {
                        // Show images that match the filter
                        toggleImageHidden(document, image_name, false);
                    }
            }
        }
    }


    /**
     * Get an array of image layers for an image
     * 
     * @param {string} image_name image name
     * @returns {Array} image stack; array of images
     */
    getImageStackByName(image_name) {
        let image_stack = [];
        for (let image_layer of this.image_stack) {
            if (image_name in image_layer) {
                image_stack.push(image_layer[image_name]);
            }
        }
        return (image_stack);
    }


    /**
     * Negate autoload_labels_on_dir_select
     */
    changeAutoLoadOnDirSelect() {
        this.autoload_labels_on_dir_select = !this.autoload_labels_on_dir_select;
        this.updateState();
    }


    render() {
        return (
            <div className="Grid" key={this.component_updater}>
                <div className="header-container">
                    {/* <Legend
                        classes={this.classes}
                    /> */}
                    {this.src !== "" &&
                        <h2>{this.src}</h2>
                    }
                    <div className={this.images_shown ? "hidden" : "controls-container"}>
                        <button
                            onClick={this.selectImageDir}
                            className="button">
                            Select Directory
                        </button>
                        <div className="change-grid-width-container">
                            <label>
                                Filter By Class Type: {this.filtered_class_type}
                            </label>
                            <Dropdown
                                items={[...Object.values(FILTER_MODES), ...this.class_types]}
                                callback={(selected_class_type) => this.changeFilteredClassType(selected_class_type)}
                            />
                            {!(Object.values(FILTER_MODES).includes(this.filtered_class_type)) &&
                                <div>
                                    <label>
                                        Filter By Class Value:
                                    </label>
                                    <Dropdown
                                        items={[...this.classes[this.filtered_class_type].class_values]}
                                        callback={(selected_class_value, checked) => this.changeGridFilter(selected_class_value, checked)}
                                        dropdown_content_type={"checkbox"}
                                        checkbox_default_values={this.filtered_class_checkbox_values}
                                    />
                                </div>
                            }
                            <label htmlFor="change-grid-width-og">
                                Grid Width:
                            </label>
                            <input
                                id="change-grid-width-og"
                                type="number"
                                defaultValue={this.grid_width}
                                size={2} // Number of visible digits
                                step={1}
                                min={1}
                                max={99}
                                onChange={(event) => changeGridWidth(event, this, document)}>
                            </input>
                        </div>
                        <div className="change-grid-width-container">
                            <label>
                                Autoload Labels on Directory Select:
                            </label>
                            <input
                                type="checkbox"
                                name={"autoload_labels_on_dir_select"}
                                id={"autoload_labels_on_dir_select"}
                                onChange={this.changeAutoLoadOnDirSelect}
                                checked={this.autoload_labels_on_dir_select}
                            ></input>
                        </div>
                    </div>
                    <div className={this.images_shown ? "controls-container" : "hidden"}>
                        <button
                            onClick={this.selectImageDir}
                            className="button">
                            Select Directory
                        </button>
                        <button
                            onClick={this.loadNextDir}
                            className="button">
                            Next Directory
                        </button>
                        <button
                            onClick={this.addImageLayer}
                            className="button">
                            Add Image Layer
                        </button>
                        <div className="change-grid-width-container">
                            <label>
                                Filter By Class Type: {this.filtered_class_type}
                            </label>
                            <Dropdown
                                items={[...Object.values(FILTER_MODES), ...this.class_types]}
                                callback={(selected_class_type) => this.changeFilteredClassType(selected_class_type)}
                            />
                             {!(Object.values(FILTER_MODES).includes(this.filtered_class_type)) &&
                                <div>
                                    <label>
                                        Filter By Class Value:
                                    </label>
                                    <Dropdown
                                        items={[...this.classes[this.filtered_class_type].class_values]}
                                        callback={(selected_class_value, checked) => this.changeGridFilter(selected_class_value, checked)}
                                        dropdown_content_type={"checkbox"}
                                        checkbox_default_values={this.filtered_class_checkbox_values}
                                    />
                                </div>
                            }
                            <label htmlFor="change-grid-width-new">
                                Grid Width:
                            </label>
                            <input
                                id="change-grid-width-new"
                                type="number"
                                defaultValue={this.grid_width}
                                size={2} // Number of visible digits
                                step={1}
                                min={1}
                                max={99}
                                onChange={(event) => changeGridWidth(event, this, document)}>
                            </input>
                        </div>
                        <div className="change-grid-width-container">
                            <label>
                                Autoload Labels on Directory Select:
                            </label>
                            <input
                                type="checkbox"
                                name={"autoload_labels_on_dir_select"}
                                id={"autoload_labels_on_dir_select"}
                                onChange={this.changeAutoLoadOnDirSelect}
                                checked={this.autoload_labels_on_dir_select}
                            ></input>
                        </div>
                        <button
                            onClick={() => loadLabels(window, this, this.label_loadnames)}
                            className="button">
                            Load Labels
                        </button>
                        {this.label_loadnames === undefined &&
                            /* Hide normal save button when custom ones are present */
                            <button
                                onClick={() => saveLabels(window, this)}
                                className="button">
                                Save Labels
                            </button>
                        }
                        <button
                            onClick={this.clearAll}
                            className="button">
                            Clear All Labels
                        </button>
                        <div className="label-filename-container">
                            {this.label_savenames !== undefined && Object.keys(this.label_savenames).map((button_name, i) => (
                                <button
                                    onClick={() => saveLabels(window, this, this.label_savenames[button_name])}
                                    className="button"
                                    key={button_name}>
                                    {"Save " + button_name + " Labels"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div id="grid-table" style={{display:"grid", gridTemplateColumns: "repeat(" + this.grid_width + ",1fr)" }}>
                    {this.image_names.map(image_name => (
                        // Use Fragment so React doesn't complain about not having a key,
                        // but we don't want to add a div to the DOM
                        <Fragment key={image_name}>
                            <MultiClassGridImage
                                image={this.images[image_name]}
                                image_name={image_name}
                                classes={this.classes}
                                image_stack={
                                    this.getImageStackByName(image_name)
                                }
                                default_classes={
                                    image_name in this.labels 
                                        ? this.labels[image_name] 
                                        : null
                                }
                            />
                        </Fragment>
                    ))}
                </div>
            </div>
        )
    }

    componentDidMount() {
        // Ensure update runs once the page is fully loaded
        setInterval(() => {
            if (!this.update_success) {
                this.update_success = update_all_overlays();
                // Update filters (hidden class) on images
                this.filterImages();
            }
        }, 1000)
    }

    componentDidUpdate() {
        // Update overlays
        this.update_success = update_all_overlays();
        // Update filters (hidden class) on images
        this.filterImages();
    }
}

export default MultiClassGrid;