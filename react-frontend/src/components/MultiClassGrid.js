// Grid labeler that supports multiple classes via checkboxes
import { Component, Fragment } from 'react';
import MultiClassGridImage from "./MultiClassGridImage.js";
import Dropdown from './Dropdown.js';
import "../css/Grid.css";
// import "../css/MultiClassGrid.css";
const { update_all_overlays } = require("../QASM/utils.js");
const { initEventListeners, changeGridWidth, toggleImageHidden, initLabels, loadLabels, saveLabels, clearAllLabels, addImageLayer, getImageStackByName, loadImageDir, selectImageDir, loadNextDir } = require("../QASM/grid_utils.js");

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
        initEventListeners(window, document, this);

        // Hack for dev
        this.src = "Foundation Field 2 (Dennis Zuber)/Videos/7-08/Row 1, 16/3840x2160@120fps/Pass A/DS Splits/DS 000/bottom Raw Images/"
        loadImageDir(window, this);

        // Bind functions
        this.updateState = this.updateState.bind(this);
        this.updateLocalLabels = this.updateLocalLabels.bind(this);
        this.changeAutoLoadOnDirSelect = this.changeAutoLoadOnDirSelect.bind(this);
        this.filterImages = this.filterImages.bind(this);
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
                            onClick={() => selectImageDir(window, this)}
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
                            onClick={() => selectImageDir(window, this)}
                            className="button">
                            Select Directory
                        </button>
                        <button
                            onClick={() => loadNextDir(window, this)}
                            className="button">
                            Next Directory
                        </button>
                        <button
                            onClick={() => addImageLayer(window, this)}
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
                            onClick={() => clearAllLabels(this)}
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
                                    getImageStackByName(this, image_name)
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