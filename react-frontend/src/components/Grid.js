import { Component, Fragment } from 'react';
import GridImage from "./GridImage.js";
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
const { FILTER_MODES, initProps, initEventListeners, changeGridWidth, toggleImageHidden, initLabels, loadLabels, changeAutoLoadOnDirSelect, saveLabels, clearAllLabels, addImageLayer, getImageStackByName, selectImageDir} =  require("../QASM/grid_utils.js");

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

class Grid extends Component {
    constructor(props) {
        super(props);
        
        // Initialize props
        initProps(this, props);
        
        // Get overlay info
        this.initOverlays();

        // Attach event listeners
        initEventListeners(window, document, this);

        // Bind functions
        this.updateLocalLabels     = this.updateLocalLabels.bind(this);
        this.initOverlays          = this.initOverlays.bind(this);
        this.changeGridFilter      = this.changeGridFilter.bind(this);
        this.getClassFromImageName = this.getClassFromImageName.bind(this);
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
     * Scrape the page for all the current labels
     */
    updateLocalLabels() {
        // Get state of each GridImage
        this.labels = initLabels(this); // Gen new object w/datetime
        for (let i=0; i < this.image_names.length; i++) {
            let image_name = this.image_names[i];
            let class_name = document.getElementById(image_name).classList[1];
            this.labels[image_name] = {
                "class": class_name
            }
        }
    }


    /**
     * Get the class name from the image name
     * 
     * @param {string} image_name
     * @returns {string} class name
     */
    getClassFromImageName(image_name) {
        // Default to the first class
        let _class = this.classes[0].class_name;
        if (image_name in this.labels) {
            _class = this.labels[image_name]["class"]
            // If class name is not in the classes list, clear the labels
            if (!this.classes.find(x => x.class_name === _class)) {
                alert("Class name '" + _class + "' not found in classes list, clearing loaded labels.");
                this.labels = {};
            }
        }
        return _class
    }


    /**
     * Change the filtered class and put it at the top
     * 
     * @param {string} class_name 
     */
    changeGridFilter(class_name) {
        this.filtered_class_name = class_name;
        // Toggle hidden class on images that don't match the filter
        for (let image_name of this.image_names) {
            switch (this.filtered_class_name) {
                case FILTER_MODES.no_filter:
                    // Show all images
                    toggleImageHidden(document, image_name, false);
                    break;
                default:
                    if (this.filtered_class_name === null || this.filtered_class_name === undefined) {
                        // Show all images if no filter is selected
                        toggleImageHidden(document, image_name, false);
                    } else if (
                        !(image_name in this.labels) ||
                        this.labels[image_name]["class"] !== this.filtered_class_name
                    ) {
                        // Hide images with no labels or that don't match the filter
                        toggleImageHidden(document, image_name, true);
                    } else if (this.labels[image_name]["class"] === this.filtered_class_name) {
                        // Show images that match the filter
                        toggleImageHidden(document, image_name, false);
                    }
            }
        }
        this.updateLocalLabels(); // Update current labels
    }


    render() {
        return (
            <div className="Grid" key={this.component_updater}>
                <div className="header-container">
                    {this.src !== "" &&
                        <h2>{this.src}</h2>
                    }
                    {/* TODO: Reimplement so that it looks nice */}
                    {/* <Legend
                        classes={this.classes}
                    /> */}
                    <div className={this.images_shown ? "hidden" : "controls-container"}>
                        <button
                            onClick={() => selectImageDir(window, this)}
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
                        <div className="change-grid-width-container">
                            <label>
                                Autoload Labels on Directory Select:
                            </label>
                            <input
                                type="checkbox"
                                name={"autoload_labels_on_dir_select"}
                                id={"autoload_labels_on_dir_select"}
                                onChange={() => changeAutoLoadOnDirSelect(this)}
                                checked={this.autoload_labels_on_dir_select}
                            ></input>
                        </div>
                    </div>
                    <div className={this.images_shown ? "controls-container" : "hidden"}>
                        <button
                            onClick={() => selectImageDir(window, this)}
                            className="button">
                            Select Directory
                        </button>
                        <button 
                            onClick={() => addImageLayer(window, this)}
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
                        <div className="change-grid-width-container">
                            <label>
                                Autoload Labels on Directory Select:
                            </label>
                            <input
                                type="checkbox"
                                name={"autoload_labels_on_dir_select"}
                                id={"autoload_labels_on_dir_select"}
                                onChange={() => changeAutoLoadOnDirSelect(this)}
                                checked={this.autoload_labels_on_dir_select}
                            ></input>
                        </div>
                        <button 
                            onClick={() => loadLabels(window, this, this.label_loadnames)} 
                            className="button">
                            Load Labels
                        </button>
                        <button 
                            onClick={() => saveLabels(window, this)} 
                            className="button">
                            Save Labels
                        </button>
                        <button 
                            onClick={() => clearAllLabels(this)} 
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
                                    this.getClassFromImageName(image_name)
                                }
                                image_stack={
                                    getImageStackByName(this, image_name)
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
                this.changeGridFilter(this.filtered_class_name);
            }
        }, 1000)
    }

    componentDidUpdate() {
        // Update overlays
        this.update_success = update_all_overlays();
        // Update filters (hidden class) on images
        this.changeGridFilter(this.filtered_class_name);
    }
}

export default Grid;