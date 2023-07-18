// ####GRID UTILS####
import $ from "jquery";
const { update_all_overlays, getOneFolderUp, getCurrentFolder, getChildPath } = require("./utils.js");
const { function_names } = require("../../public/electron_constants.js");
const { init_keybinds, get_keybind_in_keypress_event } = require("./keybind_utils.js");

const GRID_KEYBIND_NAMES = {
    SAVE_LABELS: "save_labels_keybind",
    TOGGLE_IMAGE_LAYER: "toggle_image_layer_keybind",
    NEXT_ROW: "next_row_keybind",
    PREV_ROW: "prev_row_keybind",
}
const DEFAULT_KEYBINDS = {
    [GRID_KEYBIND_NAMES.SAVE_LABELS]: ["ctrlKey", "s"],
    [GRID_KEYBIND_NAMES.TOGGLE_IMAGE_LAYER]: "b",
    [GRID_KEYBIND_NAMES.NEXT_ROW]: "n",
    [GRID_KEYBIND_NAMES.PREV_ROW]: "h",
}

export const FILTER_MODES = {
    "no_filter": "no filter",
    // "group_by_class": "group by class", // TODO: implement
}


/**
 * Update the state variables and force
 * the page to update.
 * 
 * @param {*} component component that called this function: pass in `this`
 */
export function updateState(component) {
    component.setState({
        labels: component.labels,
        src: component.src,
    });

    // Force page to update
    component.component_updater++;
}


/**
 * Initialize the component props and state
 * 
 * @param {*} component component that called this function: pass in `this`
 * @param {*} props component props
 */
export function initProps(component, props) {
    component.images = {};
    component.image_names = [];
    component.class_types = [];
    component.component_updater = 0;
    component.image_stack = [];
    component.hover_image_id = null;
    component.images_shown = false;
    component.update_success = false;
    component.allow_next_scroll = false;
    component.filtered_class_type = FILTER_MODES.no_filter; // high level 
    component.filtered_class_values = []; // selected value within a class type
    component.filtered_class_checkbox_values = []; // checkbox values for the current filtered class values
    // Store the folder names in all the directories we've loaded
    component.next_dir_cache = {}; // [<string root_folder_name>: Array[<string foldernames>]]

    // Read props
    component.QASM = props.QASM;
    component.grid_width = props.grid_width || 1;
    component.classes = props.classes; // {<string class_type>: {"selector_type": <string>, "class_values": [<string>], "default": <string> }}
    component.label_savenames = props.label_savenames || undefined; // {<string button_name>: <string savename>, ...}
    component.label_loadnames = props.label_loadnames || undefined; // [<string loadname1>, <string loadname2>, ...]
    component.autoload_labels_on_dir_select = props.autoload_labels_on_dir_select || false;
    component.image_layer_folder_names = props.image_layer_folder_names || undefined; // [Array[<string>], ...]
    component.labels = initLabels(component);
    
    // Initialize keybinds
    init_keybinds(props, DEFAULT_KEYBINDS);

    // Initialize class_names (normal grid)
    try {
        component.class_names = component.classes.map(class_info => class_info.class_name)
    } catch (error) {
        console.log("WARNING: class_info not found in classes ", component.classes);
    }

    // Initialize class_types (multi-class grid)
    try {
        component.class_types = Object.keys(component.classes);
    } catch (error) {
        console.log("WARNING: `classes` are not in the expected structure: ", component.classes);
    }
    
    // Initialize state
    component.state = {
        labels: component.labels,
        src: component.src,
    };
}


/**
 * Attach event listeners to the page.
 * 
 * @param {*} window window object
 * @param {*} document document object
 * @param {*} component component that called this function: pass in `this`
 */
export function initEventListeners(window, document, component) {
    if (localStorage.getItem("grid_event_listeners_initialized") === "true") {
        // Event listeners already initialized, don't do it again
        console.log("Grid event listeners already initialized.");
        return;
    }

    console.log("Initializing grid event listeners...");

    // Update the overlays whenever the page size is changed
    window.addEventListener("resize", update_all_overlays);

    // Update which image is currently being hovered
    document.addEventListener("mousemove", (e) => {
        if (e.target.className.includes("hover-target")) {
            // Every single hover-target will be inside of a div that's 
            // inside of a div, that has the id that we're trying to select.
            component.hover_image_id = e.target.parentNode.parentNode.id;
        } else {
            component.hover_image_id = null;
        }
    });

    // Prevent weird behavior when scrolling
    window.addEventListener("scroll", () => {
        if (component.allow_next_scroll) {
            component.allow_next_scroll = false;
        } else {
            component.hover_image_id = null;
        }
    });

    // Keybinds
    window.addEventListener("keydown", (e) => {
        switch (get_keybind_in_keypress_event(DEFAULT_KEYBINDS, e)) {
            case GRID_KEYBIND_NAMES.SAVE_LABELS:
                saveLabels(window, component);
                break;
            case GRID_KEYBIND_NAMES.TOGGLE_IMAGE_LAYER:
               changeImage(document, component.hover_image_id);
                break;
            case GRID_KEYBIND_NAMES.NEXT_ROW:
                autoScroll(component, component.hover_image_id, GRID_KEYBIND_NAMES.NEXT_ROW);
                break;
            case GRID_KEYBIND_NAMES.PREV_ROW:
                autoScroll(component, component.hover_image_id, GRID_KEYBIND_NAMES.PREV_ROW);
                break;
            default:
                break;
        }
    });

    localStorage.setItem("grid_event_listeners_initialized", "true");
}


/**
 * Scroll page to the next row 
 * 
 * @param {*} component component that called this function: pass in `this`
 * @param {string} hover_image_id id of the current row
 * @param {string} keybind_name keybind name
 */
export function autoScroll(component, hover_image_id, keybind_name) {
    let row_not_found = true;
    if (hover_image_id !== null) {
        let jquery_next_image = $("#" + hover_image_id); // Start at current row
        let current_top = jquery_next_image.offset().top; // Top of current row
        let next_image;
        while (row_not_found) {
            // Try the next (or previous) image
            jquery_next_image = keybind_name === GRID_KEYBIND_NAMES.NEXT_ROW ? jquery_next_image.next() : jquery_next_image.prev();
            next_image = document.getElementById(jquery_next_image.attr("id"))
            
            // If the next_image has a different 'top' as the current image, it's in a different row
            // This protects against scrolling to an image in the same row
            if (jquery_next_image.offset().top !== current_top) {
                // Ensure that the next image isn't hidden
                if (!next_image.classList.contains("hidden")) {
                    // We found a row to scroll to
                    row_not_found = false;
                    break;
                }
            }
        }

        // Scroll to next row
        $(document).scrollTop(jquery_next_image.offset().top);
        // Set next image as hovered for consecutive navigation
        component.hover_image_id = jquery_next_image.attr("id");
        // Override scroll protection
        component.allow_next_scroll = true; 
    }
}


/**
 * Handle keypresses for the grid width input
 * 
 * @param {*} event on change event
 * @param {*} component component that called this function: pass in `this`
 * @param {*} document document object
 */
export function changeGridWidth(event, component, document) {
    component.grid_width = event.target.value;

    // Reformat the grid by changing the grid-table css
    document.getElementById("grid-table").style.gridTemplateColumns = "repeat(" + component.grid_width + ", 1fr)";
}


/**
 * Toggle (hide or show) a GridImage,
 * or set it to hidden if hidden is defined.
 * 
 * @param {*} document document object
 * @param {string} image_name 
 * @param {boolean} hidden
 */
export function toggleImageHidden(document, image_name, hidden = undefined) {
    // Get the MultiClassGridImage container div
    let image = document.getElementById(image_name);
    if (image === undefined || image === null) {
        // Image not found
        return;
    }

    if (hidden === undefined) {
        image.classList.toggle("hidden");
    } else {
        // Set hidden class
        if (hidden && !image.classList.contains("hidden")) {
            image.classList.add("hidden");
        } else if (!hidden && image.classList.contains("hidden")) {
            image.classList.remove("hidden");
        }
    }
}


/**
 * Cycle through the image layers for an image
 * 
 * @param {*} document document object
 * @param {string} hover_image_id id of the current image
 */
export function changeImage(document, hover_image_id) {
    if (hover_image_id === null) {
        return;
    }
    // firstChild = image holder div
    // childNodes of image holder div = image layers

    let layers = document.getElementById(hover_image_id).firstChild.childNodes;
    // layers[0] is the image, layers[n] is image_stack[n-1], layers[layers.length-1] is the class-overlay
    for (let idx = 0; idx < layers.length; idx++) {
        let layer = layers[idx];
        // Skip overlays and hidden images
        if (layer.id.includes("overlay") || layer.classList.contains("hidden")) {
            continue;
        }

        // Change currently shown image to hidden
        layer.classList.add("hidden");

        // Change next hidden image to shown
        if (idx + 1 === layers.length - 1) {
            // Last index is the class-overlay
            // If we're at the last layer, turn on the og image
            layers[0].classList.remove("hidden");
        } else {
            // Un-hide next image
            layers[idx + 1].classList.remove("hidden");
        }
        // Done
        break;
    }
}


/**
 * Load images from the current source directory
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 */
export async function loadImages(window, component) {
    component.images = await component.QASM.call_backend(window, function_names.LOAD_IMAGES, component.src);
    component.image_names = Object.keys(component.images).sort();
    clearAllLabels(component);
    // Set the images shown to true now that the images are shown
    component.images_shown = true;
}


/**
 * Load images from the current source directory,
 * and try and autoload labels and image layers.
 * Autoload requires autoload_labels_on_dir_select, component.label_loadnames,
 * and component.image_layer_loadnames to be defined.
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 */
export async function loadImageDir(window, component) {
    if (component.src !== undefined) {
        component.image_stack = []; // Clear image stack on new directory load
        if (component.autoload_labels_on_dir_select !== undefined && component.autoload_labels_on_dir_select) {
            autoLoadLabels(window, component); // Try and autoload labels
        }
        autoLoadImageLayers(window, component); // Try and autoload image layers
        await loadImages(window, component); // Load images
        updateState(component);
    }
}


/**
 * Open a directory selection dialog and 
 * load in all the images.
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 */
export async function selectImageDir(window, component) {
    let dir_path = await component.QASM.call_backend(window, function_names.OPEN_DIR_DIALOG, component.src);
    if (dir_path !== undefined) {
        component.src = dir_path;
        await loadImageDir(window, component);
    } else {
        console.log("Prevented loading invalid directory.");
    }
}


/**
 * Load the next directory
 * TODO: generalize for arbitrary directory structure
 * Requires component.next_dir_cache to be defined.
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`  
 */
export async function loadNextDir(window, component) {
    let current_folder = getCurrentFolder(component.src); // Current folder name, without full path
    let current_dir = getOneFolderUp(component.src); // One folder up
    let root_dir = getOneFolderUp(current_dir); // Two folders up

    let folders;
    if (root_dir in component.next_dir_cache) {
        // If we have folder info cached, use it
        folders = component.next_dir_cache[root_dir]
    } else {
        // Else get all folders in root_dir and add to cache
        let response = await component.QASM.call_backend(window, function_names.GET_FOLDER_CONTENTS, root_dir);
        folders = response.folders.sort();
        component.next_dir_cache[root_dir] = folders;
    }
    

    // Get index of current folder
    let current_folder_idx = folders.indexOf(current_dir);
    if (current_folder_idx + 1 === folders.length) {
        alert("No more directories to load.");
        return;
    } else {
        // Start at the next dir in root_dir, with the same current image folder name
        component.src = getChildPath(folders[current_folder_idx + 1], current_folder)
        await loadImageDir(window, component);
    }
}


/**
     * Create a new labels object with current metadata
     * (datetime, app name, app version), or add these 
     * fields to an existing labels object if they don't exist 
     * already.
     * 
     * @param {*} component component that called this function: pass in `this`
     * @param {Object} labels existing labels object
     * @returns {Object} labels
     */
export function initLabels(component, labels = null) {
    if (labels === null) {
        // Create new labels
        labels = {}
    }
    
    if (!("name" in labels)) {
        labels["name"] = component.QASM.config["name"];
    }

    if (!("version" in labels)) {
        labels["version"] = component.QASM.config["version"];
    }

    if (!("datetime" in labels)) {
        labels["datetime"] = new Date().toLocaleString();
    }

    return labels;
}


/**
 * Prompt user to select a file with labels
 * and load them in.
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 * @param {Array[string]} loadnames Array of filenames to try and autoload
 */
export async function loadLabels(window, component, loadnames = undefined) {
    let params = {
        // Start one folder up from the current directory
        path: getOneFolderUp(component.src),
        // Try and load a specific file if loadnames is defined
        loadnames: loadnames,
    }

    // Open browser and load labels
    let labels = await component.QASM.call_backend(window, function_names.LOAD_JSON_DIALOG, params);
    component.labels = initLabels(component, labels);
    console.log(component.labels);

    if (Object.keys(component.labels).length > 0) {
        updateState(component); // Update state to rerender page
    } else {
        console.log("Prevented loading empty labels.");
    }
}


/**
 * Try and auto-load labels if we have loadnames. Requires component.label_loadnames to be defined.
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 */
export async function autoLoadLabels(window, component) {
    if (component.label_loadnames !== undefined) {
        // Wait for previous window to close
        setTimeout(() => {
            loadLabels(window, component, component.label_loadnames);
        }, 1000)
    }
}

/**
 * Negate component.autoload_labels_on_dir_select
 * 
 * @param {*} component component that called this function: pass in `this`
 */
export function changeAutoLoadOnDirSelect(component) {
    component.autoload_labels_on_dir_select = !component.autoload_labels_on_dir_select;
    updateState(component);
}


/**
 * Scrape the page for the current labels
 * and prompt the user to specify where to save them.
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 * @param {string} savename filename to save labels to
 */
export async function saveLabels(window, component, savename = "") {
    // Use label format of the current page
    component.updateLocalLabels();
    let params = {
        labels: component.labels,
        // Start one folder up from the current directory
        path: getOneFolderUp(component.src),
        savename: savename,
    }

    await component.QASM.call_backend(window, function_names.SAVE_JSON_DIALOG, params);
}


/**
 * Clear all the current labels
 * 
 * @param {*} component component that called this function: pass in `this`
 */
export function clearAllLabels(component) {
    // Set all classes to the default
    component.labels = initLabels(component);
    updateState(component);
}


/**
 * Prompt user to select a directory
 * and push all the images onto the image stack
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 */
export async function addImageLayer(window, component) {
    // Prompt user to select directory
    let dir_path = await component.QASM.call_backend(window, function_names.OPEN_DIR_DIALOG, component.src);
    console.log(dir_path);

    // Load images and add them to the image stack
    let image_layer = await component.QASM.call_backend(window, function_names.LOAD_IMAGES, dir_path);
    if (Object.keys(image_layer).length === 0) {
        console.log("Prevent adding empty layer.");
    } else {
        component.image_stack.push(image_layer);
        console.log(component.image_stack);
    }
    component.updateLocalLabels();
    updateState(component);
}


/**
 * Get an array of image layers for an image
 * 
 * @param {*} component component that called this function: pass in `this`
 * @param {string} image_name image name
 * @returns {Array} image stack; array of images
 */
export function getImageStackByName(component, image_name) {
    let image_stack = [];
    for (let image_layer of component.image_stack) {
        if (image_name in image_layer) {
            image_stack.push(image_layer[image_name]);
        }
    }
    return (image_stack);
}


/**
 * Try and auto-load image layers if we have image_layer_folder_names
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 */
export async function autoLoadImageLayers(window, component) {
    if (component.image_layer_folder_names !== undefined) {
        let root_dir = getOneFolderUp(component.src);
        let current_folder = getCurrentFolder(component.src)
        let n_layers = component.image_layer_folder_names[0].length; // Number of layers to load
        for (let folder_name_group of component.image_layer_folder_names) {
            // Try each group of folder names in order, skipping
            // any that result in empty layers
            for (let folder_name of folder_name_group) {
                // Don't add current folder as a layer
                if (folder_name === current_folder) {
                    n_layers--; // We need one fewer layer
                } else {
                    // Load images and add them to the image stack
                    let image_layer = await component.QASM.call_backend(window, function_names.LOAD_IMAGES, getChildPath(root_dir, folder_name));
                    if (Object.keys(image_layer).length === 0) {
                        console.log("Prevent adding empty layer, skipping to next folder group.");
                        component.image_stack = []; // Clear image stack to allow next group to try and load
                        n_layers = component.image_layer_folder_names[0].length; // Reset n_layers
                        break;
                    } else {
                        component.image_stack.push(image_layer);
                    }
                    console.log(component.image_stack);
                }
            }
            // If we have the correct number of layers, we're done
            if (component.image_stack.length === n_layers) {
                break;
            }
        }

        updateState(component);
    }
}