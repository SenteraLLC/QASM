import { Component, Fragment } from 'react';
import GridImage from "./GridImage.js";
import Legend from "./Legend.js";
import Dropdown from './Dropdown.js';
import x_overlay from "../icons/x.svg";
import x_overlay_red from "../icons/x_red.svg";
import x_overlay_yellow from "../icons/x_yellow.svg";
import x_overlay_white from "../icons/x_white.svg";
import x_overlay_green from "../icons/x_green.svg";
import criss_cross from "../icons/criss_cross.svg";
import curved from "../icons/curved.svg";
import sparse from "../icons/sparse.svg";
import field_edge from "../icons/field_edge.svg";
import "../css/Grid.css";
const { update_all_overlays } =  require("../QASM/utils.js");
const { autoScroll, changeGridWidth } =  require("../QASM/grid_utils.js");
const { function_names } = require("../../public/electron_constants.js");

const COLORS = {
    "default": "default",
    "red": "red",
    "yellow": "yellow",
    "white": "white",
    "green": "green",
}

const OVERLAYS = {
    "x_overlay": {
        [COLORS.default]: x_overlay,
        [COLORS.red]: x_overlay_red,
        [COLORS.yellow]: x_overlay_yellow,
        [COLORS.white]: x_overlay_white,
        [COLORS.green]: x_overlay_green,
    },
    "criss_cross": {
        [COLORS.default]: criss_cross
    },
    "curved": {
        [COLORS.default]: curved
    },
    "sparse": {
        [COLORS.default]: sparse
    },
    "field_edge": {
        [COLORS.default]: field_edge
    }
}

const FILTER_MODES = {
    "no_filter": "no filter",
    "group_by_class": "group by class",
}

class Grid extends Component {
    images = {};
    image_names = [];
    grid_width = 2;
    grid_image_names = [];
    src = "";
    classes = []; // Array of {"class_name": <string>, "svg_overlay": <string>}
    class_names = []; // Array of all "class_name" values from the classes array
    filtered_class_name = null;
    component_updater = 0;
    image_stack = []; 
    hover_image_id = null;
    images_shown = false;
    update_success = false;
    allow_next_scroll = false;
    default_classes = [
        {"class_name": "plant", "svg_overlay": null}, 
        {"class_name": "rogue", "svg_overlay": "x_overlay"},
    ];

    constructor(props) {
        super(props);
        
        // Initialize props
        this.QASM         = props.QASM
        this.grid_width   = props.grid_width || 2;
        this.classes      = props.classes    || this.default_classes
        this.src          = props.src
        this.class_names  = this.classes.map(class_info => class_info.class_name)
        
        this.labels = this.initLabels();
        this.state = {
            labels: this.labels,
            src: this.src,
        };
        
        // Get overlay info
        this.initOverlays();

        // Attach event listeners
        this.initEventListeners();

        // Bind functions
        this.loadImages          = this.loadImages.bind(this);
        this.initLabels          = this.initLabels.bind(this);
        this.saveLabels          = this.saveLabels.bind(this);
        this.loadLabels          = this.loadLabels.bind(this);
        this.clearAll            = this.clearAll.bind(this);
        this.selectImageDir      = this.selectImageDir.bind(this);
        this.updateState         = this.updateState.bind(this);
        this.updateLocalLabels   = this.updateLocalLabels.bind(this);
        this.addImageLayer       = this.addImageLayer.bind(this);
        this.getImageStackByName = this.getImageStackByName.bind(this);
        this.changeImage         = this.changeImage.bind(this);
        this.initOverlays        = this.initOverlays.bind(this);
        this.initEventListeners  = this.initEventListeners.bind(this);
        this.changeGridFilter    = this.changeGridFilter.bind(this);
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
            } 
            else {
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
                this.saveLabels();
            }

            if (this.hover_image_id !== null && e.key === "b") {
                this.changeImage(this.hover_image_id);
            }

            if (this.hover_image_id !== null ) {
                // n for next, h for previous
                autoScroll(this, this.hover_image_id, e.key);
            }
        });
    }


    /**
     * Run through the classes list and
     * check for supported overlays
     */
    initOverlays() {
        // Render stock overlays
        for (let [idx, class_props] of this.classes.entries()) {
            if (
                "svg_overlay" in class_props && 
                class_props["svg_overlay"] in OVERLAYS
            ) {
                let overlay_type = class_props.svg_overlay;
                "color" in class_props && class_props["color"] in COLORS 
                    ? class_props.svg_overlay = OVERLAYS[overlay_type][COLORS[class_props.color]]
                    : class_props.svg_overlay = OVERLAYS[overlay_type]["default"]
                this.classes[idx] = class_props;
            }
        }

        // Grab the document's head tag and create a style tag
        let document_head = document.getElementsByTagName('head')[0];
        let style = document.createElement('style');

        // Loop through all classes and append each classes' overlay opacity to it
        for (let each_class of this.classes) {
            if (each_class.svg_overlay == null) {
                // If the overlay doesn't exist don't show it
                style.textContent += `div.${each_class.class_name} > * > img.overlay {
                    filter: opacity(0)
                }
                `;
            }
            else if (each_class.opacity !== undefined) {
                // Use the custom overlay opacity
                style.textContent += `div.${each_class.class_name} > * > img.overlay {
                    filter: opacity(${each_class.opacity})
                }
                `;
            }
            else {
                // Use the default opacity
                style.textContent += `div.${each_class.class_name} > * > img.overlay {
                    filter: opacity(1)
                }
                `;
            }
        }

        // Append the newly created style tag to the documet head
        document_head.appendChild(style);
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
        this.component_updater++;
    }


    /**
     * Load images from the current source directory
     */
    async loadImages() {
        console.log("Src: " + this.src);
        this.images = await this.QASM.call_backend(window, function_names.LOAD_IMAGES, this.src);
        this.image_names = Object.keys(this.images).sort();
        console.log(this.images);
        this.gridSetup();
        this.clearAll();
    }
    

    /**
     * Organize the images into rows
     */
    gridSetup() {
        // Handle filtering
        switch (this.filtered_class_name) {
            case FILTER_MODES.no_filter:
                this.image_names.sort(); // Sort to undo any lingering filters
                break;
            case FILTER_MODES.group_by_class:
                // Group classes together in the same order as they appear in the config
                let ret = [];
                for (let class_name of this.class_names) {
                    let class_image_names = []
                    for (let image_name of this.image_names) {
                        // Get all images for a given class
                        if (image_name in this.labels && this.labels[image_name].class === class_name) {
                            class_image_names.push(image_name);
                        }
                    }
                    console.log(class_name, class_image_names);
                    // Sort before concat into ret
                    ret = ret.concat(class_image_names.sort());
                }
                this.image_names = ret;
                break;
            default: 
                // Sort image names with the filtered class first
                let filtered = [];
                let unfiltered = [];
                for (let image_name of this.image_names) {
                    // If image is of the filtered class, store in filtered array
                    if (image_name in this.labels && this.labels[image_name].class === this.filtered_class_name) {
                        filtered.push(image_name);
                    } else {
                        unfiltered.push(image_name);
                    }
                }
                // Concatanate together with filtered in front
                this.image_names = filtered.sort().concat(unfiltered.sort());
                break;
        }

        // Divide grid based on the grid width prop
        let cur_im;
        let grid_counter = 0;
        let row_imgs = [];
        this.grid_image_names = [];
        for (let i = 0; i < this.image_names.length; i++) {
            cur_im = this.image_names[i];

            // Add to grid
            if (grid_counter >= this.grid_width) {
                this.grid_image_names.push(row_imgs);
                grid_counter = 0;
                row_imgs = [];
            }
            grid_counter++;
            row_imgs.push(cur_im);
        }
        this.grid_image_names.push(row_imgs);
    }


    /**
     * Scrape the page for all the current labels
     */
    updateLocalLabels() {
        // Get state of each GridImage
        this.labels = this.initLabels(); // Gen new object w/datetime
        for (let i=0; i < this.image_names.length; i++) {
            let image_name = this.image_names[i];
            let class_name = document.getElementById(image_name).classList[1];
            this.labels[image_name] = {
                "class": class_name
            }
        }
    }


    /**
     * Create a new labels object with current metadata
     * (datetime, app name, app version), or add these 
     * fields to an existing labels object if they don't exist 
     * already.
     * 
     * @param {Object} labels existing labels object
     * @returns {Object} labels
     */
    initLabels(labels = null) {
        if (labels === null) {
            // Create new labels
            labels = {}
        }
        
        if (!("name" in labels)) {
            labels["name"] = this.QASM.config["name"];
        }

        if (!("version" in labels)) {
            labels["version"] = this.QASM.config["version"];
        }

        if (!("datetime" in labels)) {
            labels["datetime"] = new Date().toLocaleString();
        }

        return labels;
    }


    /**
     * Scrape the page for the current labels
     * and prompt the user to specify where to save them.
     */
    async saveLabels() {
        this.updateLocalLabels();

        let params = {
            labels: this.labels,
            path: this.src,
        }

        await this.QASM.call_backend(window, function_names.SAVE_JSON_FILE, params);
    }


    /**
     * Prompt user to select a file with labels
     * and load them in.
     */
    async loadLabels() {
        let params = {
            path: this.src,
        }
        // Load in previous labels
        let labels = await this.QASM.call_backend(window, function_names.LOAD_LABELS, params);
        this.labels = this.initLabels(labels);
        console.log(this.labels);
        
        if (Object.keys(this.labels).length > 0) {
            this.gridSetup();
            this.updateState(); // Update state to rerender page
        } else {
            console.log("Prevented loading empty labels.");
        }
    }

    
    /**
     * Clear all the current labels
     */
    clearAll() {
        // Set all classes to the default
        this.labels = this.initLabels();
        this.updateState();
    }


    /**
     * Open a directory selection dialog and 
     * load in all the images.
     */
    async selectImageDir() {
        let dir_path = await this.QASM.call_backend(window, function_names.OPEN_IMG_DIR);
        if (dir_path !== undefined) {
            if (this.src !== dir_path) {
                this.image_stack = []; // Clear image stack on new directory load
            }
            this.src = dir_path;
            await this.loadImages();
            
            // Set the images shown to true now that the images are shown
            this.images_shown = true;
            this.updateState();
        } else {
            console.log("Prevented loading invalid directory.");
        }
    }


    /**
     * Prompt user to select a directory
     * and push all the images onto the image stack
     */
    async addImageLayer() {
        // Prompt user to select directory
        let dir_path = await this.QASM.call_backend(window, function_names.OPEN_IMG_DIR, this.src);
        console.log(dir_path);

        // Load images and add them to the image stack
        let image_layer = await this.QASM.call_backend(window, function_names.LOAD_IMAGES, dir_path);
        if (Object.keys(image_layer).length === 0) {
            console.log("Prevent adding empty layer.");
        } else {
            this.image_stack.push(image_layer);
        }   
        console.log(this.image_stack);
        this.updateState();
    }


    /**
     * Change the filtered class and put it at the top
     * 
     * @param {string} class_name 
     *  
     */
    changeGridFilter(class_name) {
        console.log(class_name);
        this.filtered_class_name = class_name;
        this.updateLocalLabels(); // Update current labels
        this.gridSetup(); // Reformat grid
        this.updateState(); // Update page
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
        return(image_stack);
    }


    /**
     * Cycle through the image layers for an image
     * 
     * @param {string} hover_image_id id of the current image
     */
    changeImage(hover_image_id) {
        // firstChild = image holder div
        // childNodes of image holder div = image layers

        let layers = document.getElementById(hover_image_id).firstChild.childNodes;
        // layers[0] is the overlay, layers[1] is the image, layers[n] is image_stack[n-2]
        for (let idx = 0; idx < layers.length; idx++) {
            let layer = layers[idx];
            // Skip overlays and hidden images
            if (layer.id.includes("overlay") || layer.classList.contains("hidden")) {
                continue;
            }
            
            // Change currently shown image to hidden
            layer.classList.add("hidden");

            // Change next hidden image to shown
            if (idx+1 === layers.length) {
                // If we're at the last layer, turn on the og image
                layers[1].classList.remove("hidden");
            } else {
                // Un-hide next image
                layers[idx+1].classList.remove("hidden");
            }
            // Done
            break;
        }
    }

    render() {
        return (
            <div className="Grid" key={this.component_updater}>
                <div className="header-container">
                    {this.src !== "" &&
                        <h2>{this.src}</h2>
                    }
                    <Legend
                        classes={this.classes}
                    />
                    <div className={this.images_shown ? "hidden" : "controls-container"}>
                        <button
                            onClick={this.selectImageDir}
                            className="button">
                            Select Directory
                        </button>
                        <div className="change-grid-width-container">
                            <label>
                                Filter By Class:
                            </label>
                            <Dropdown
                                items={[...Object.values(FILTER_MODES), ...this.class_names]}
                                callback={(selected_class_name) => this.changeGridFilter(selected_class_name)}
                            />
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
                    </div>
                    <div className={this.images_shown ? "controls-container" : "hidden"}>
                        <button
                            onClick={this.selectImageDir}
                            className="button">
                            Select Directory
                        </button>
                        <button 
                            onClick={this.addImageLayer}
                            className="button">
                            Add Image Layer
                        </button>
                        <div className="change-grid-width-container">
                            <label>
                                Filter By Class:
                            </label>
                            <Dropdown
                                items={[...Object.values(FILTER_MODES), ...this.class_names]}
                                callback={(selected_class_name) => this.changeGridFilter(selected_class_name)}
                            />
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
                        <button 
                            onClick={this.loadLabels} 
                            className="button">
                            Load Labels
                        </button>
                        <button 
                            onClick={this.saveLabels} 
                            className="button">
                            Save Labels
                        </button>
                        <button 
                            onClick={this.clearAll} 
                            className="button">
                            Clear All Labels
                        </button>
                    </div>
                </div>
                <div id="grid-table" style={{display:"grid", gridTemplateColumns: "repeat(" + this.grid_width + ",1fr)" }}>
                    {this.image_names.map(image_name => (
                        // Use Fragment so React doesn't complain about not having a key,
                        // but we don't want to add a div to the DOM
                        <Fragment key={image_name}>
                            <GridImage
                                image={this.images[image_name]} 
                                image_name={image_name} 
                                classes={this.classes}
                                default_class={
                                    image_name in this.labels 
                                        ? this.labels[image_name]["class"] 
                                        : this.classes[0].class_name
                                }
                                image_stack={
                                    this.getImageStackByName(image_name)
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
            }
        }, 1000)
    }

    componentDidUpdate() {
        // Update overlays
        this.update_success = update_all_overlays();
    }
}

export default Grid;