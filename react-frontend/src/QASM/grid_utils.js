// ####GRID UTILS####
import $ from "jquery";
const { update_all_overlays, getOneFolderUp, getCurrentFolder, getChildPath } = require("./utils.js");
const { function_names } = require("../../public/electron_constants.js");
const { init_keybinds, get_keybind_in_keypress_event } = require("./keybind_utils.js");

const GRID_KEYBIND_NAMES = {
    SAVE_LABELS: "save_labels_keybind",
    TOGGLE_IMAGE_LAYER: "toggle_image_layer_keybind",
    TOGGLE_ALL_IMAGE_LAYERS: "toggle_all_image_layers_keybind",
    NEXT_ROW: "next_row_keybind",
    PREV_ROW: "prev_row_keybind",
    NEXT_DIRECTORY: "next_dir_keybind",
    TOGGLE_CENTER_LINE: "toggle_center_line_keybind",
    TOGGLE_ALL_CENTER_LINES: "toggle_all_center_lines_keybind",
}
const GRID_DEFAULT_KEYBINDS = {
    [GRID_KEYBIND_NAMES.SAVE_LABELS]: ["ctrlKey", "s"],
    [GRID_KEYBIND_NAMES.TOGGLE_IMAGE_LAYER]: "b",
    [GRID_KEYBIND_NAMES.TOGGLE_ALL_IMAGE_LAYERS]: "B",
    [GRID_KEYBIND_NAMES.NEXT_ROW]: "n",
    [GRID_KEYBIND_NAMES.PREV_ROW]: "h",
    [GRID_KEYBIND_NAMES.NEXT_DIRECTORY]: "Enter",
    [GRID_KEYBIND_NAMES.TOGGLE_CENTER_LINE]: "c",
    [GRID_KEYBIND_NAMES.TOGGLE_ALL_CENTER_LINES]: "C",
}

// Deep copy of GRID_DEFAULT_KEYBINDS
export let GRID_KEYBINDS = JSON.parse(JSON.stringify(GRID_DEFAULT_KEYBINDS));

// Other global variables for use in event listener handlers
export let WINDOW = undefined;
export let DOCUMENT = undefined;
export let COMPONENT = undefined;

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
 * @param {*} window window object
 * @param {*} document document object
 * @param {*} component component that called this function: pass in `this`
 * @param {*} props component props
 */
export function initProps(window, document, component, props) {
    // Set component name in window
    window.COMPONENT = component;
    
    // Set global values used in event handlers
    WINDOW = window;
    DOCUMENT = document;
    COMPONENT = component;

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
    // Store the current image layer index
    component.current_image_layer_idx = 0; // og image

    // Read props
    component.QASM = props.QASM;
    component.grid_width = props.grid_width || 1;
    component.classes = props.classes; // {<string class_type>: {"selector_type": <string>, "class_values": [<string>], "default": <string> }}
    component.label_savenames = props.label_savenames || undefined; // {<string button_name>: <string savename>, ...}
    component.label_loadnames = props.label_loadnames || undefined; // [<string loadname1>, <string loadname2>, ...]
    component.autoload_labels_on_dir_select = props.autoload_labels_on_dir_select || false;
    component.image_layer_folder_names = props.image_layer_folder_names || undefined; // [Array[<string>], ...]
    component.center_line_start_visible = props.center_line_start_visible || false;
    component.labels = initLabels(component);

    // Bind functions for deep links
    component.selectImageDir = selectImageDir.bind(component);
    component.loadImageDir   = loadImageDir.bind(component);
    component.loadLabels     = loadLabels.bind(component);
    
    // Initialize keybinds
    init_keybinds(props, GRID_DEFAULT_KEYBINDS, GRID_KEYBINDS);

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
 * Add all event listeners to the document.
 * 
 */
export function addAllEventListeners() {
    // Add event listeners. The only way I could get them to remove
    // properly was to pass them as functions with no arguments.
    DOCUMENT.addEventListener("mousemove", mousemoveEventHandler);
    DOCUMENT.addEventListener("resize", resizeEventHandler);
    DOCUMENT.addEventListener("scroll", scrollEventHandler);
    DOCUMENT.addEventListener("keydown", keydownEventHandler);
}


/**
 * Remove all event listeners from the document.
 * 
 */
export function removeAllEventListeners() {
    // Remove event listeners
    DOCUMENT.removeEventListener("mousemove", mousemoveEventHandler);
    DOCUMENT.removeEventListener("resize", resizeEventHandler);
    DOCUMENT.removeEventListener("scroll", scrollEventHandler);
    DOCUMENT.removeEventListener("keydown", keydownEventHandler);
}


/**
 * Handler for mousemove event listeners.
 * 
 * @param {object} e mousemove event
 */
export function mousemoveEventHandler(e) {
    // Update which image is currently being hovered
    if (e.target.className.includes("hover-target")) {
        // Every single hover-target will be inside of a div that's 
        // inside of a div, that has the id that we're trying to select.
        COMPONENT.hover_image_id = e.target.parentNode.parentNode.id;
    } else {
        COMPONENT.hover_image_id = null;
    }
}


/**
 * Handler for resize event listeners.
 * 
 */
export function resizeEventHandler() {
    // Update the overlays whenever the page size is changed
    update_all_overlays();
}


/**
 * Handler for scroll event listeners.
 * 
 */
export function scrollEventHandler() {
    if (COMPONENT.allow_next_scroll) {
        COMPONENT.allow_next_scroll = false;
    } else {
        COMPONENT.hover_image_id = null;
    }
}


/**
 * Handler for keydown event listeners.
 * 
 * @param {object} e keydown event
 */
export function keydownEventHandler(e) {
    // Keybinds
    switch (get_keybind_in_keypress_event(GRID_KEYBINDS, e)) {
        case GRID_KEYBIND_NAMES.SAVE_LABELS:
            saveLabels(WINDOW, COMPONENT);
            break;
        case GRID_KEYBIND_NAMES.TOGGLE_IMAGE_LAYER:
            changeImage(DOCUMENT, COMPONENT.hover_image_id);
            break;
        case GRID_KEYBIND_NAMES.TOGGLE_ALL_IMAGE_LAYERS:
            changeAllImages(DOCUMENT, COMPONENT);
            break;
        case GRID_KEYBIND_NAMES.NEXT_ROW:
            autoScroll(COMPONENT, COMPONENT.hover_image_id, GRID_KEYBIND_NAMES.NEXT_ROW);
            break;
        case GRID_KEYBIND_NAMES.PREV_ROW:
            autoScroll(COMPONENT, COMPONENT.hover_image_id, GRID_KEYBIND_NAMES.PREV_ROW);
            break;
        case GRID_KEYBIND_NAMES.NEXT_DIRECTORY:
            loadNextDir(WINDOW, COMPONENT);
            break;
        case GRID_KEYBIND_NAMES.TOGGLE_CENTER_LINE:
            toggleCenterLine(DOCUMENT, COMPONENT.hover_image_id);
            break;
        case GRID_KEYBIND_NAMES.TOGGLE_ALL_CENTER_LINES:
            toggleAllCenterLines(DOCUMENT, COMPONENT);
            break;
        default:
            break;
    }
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
export function changeImage(document, hover_image_id, new_image_layer_idx = null) {
    if (hover_image_id === null) {
        return;
    }
    // firstChild = image holder div
    // childNodes of image holder div = image layers

    let layers = document.getElementById(hover_image_id).firstChild.childNodes;
    // layers[0] is the image, layers[n] is image_stack[n-1], layers[layers.length-1] is the class-overlay, layers[layers.length-2] is the center-line-overlay
    // Find and hide the currently visible image, and then show the next image in the stack 
    const n_layers = layers.length - 2; // Subtract 2 for the overlay and center line
    for (let idx = 0; idx < n_layers; idx++) {
        let layer = layers[idx];
        // Skip overlays and hidden images
        if (layer.id.includes("overlay") || layer.classList.contains("hidden")) {
            continue;
        }

        // Change currently shown image to hidden
        layer.classList.add("hidden");

        if (new_image_layer_idx === null) {
            if (idx + 1 === n_layers) {
                // If we're at the last layer, turn on the og image
                new_image_layer_idx = 0;
            } else {
                // Un-hide next image
                new_image_layer_idx = idx + 1;
            }
        }
        break;
    }

    // Show the new_image_layer_idx
    layers[new_image_layer_idx].classList.remove("hidden");
}

export function changeAllImages(document, component) {
    // Layer to show is the next layer after component.current_image_layer_idx
    // if the next index is the last index, show the original image
    // image_stack doesn't include the original image, so if there are n layers,
    // so when the current layer idx is n, the new layer idx should return to 0
    let new_image_layer_idx = component.current_image_layer_idx + 1;
    if (component.current_image_layer_idx === component.image_stack.length) {
        new_image_layer_idx = 0;
    }

    // Change the image for all images
    for (let image_name of component.image_names) {
        changeImage(document, image_name, new_image_layer_idx);
    }
    // Update the current image layer index
    component.current_image_layer_idx = new_image_layer_idx;
}


/**
 * Load images from the current source directory
 * 
 * @param {*} window window object
 * @param {*} component component that called this function: pass in `this`
 * @param {string} bucket_name bucket name
 */
export async function loadImages(window, component, bucket_name = undefined) {
    let params = {
        "start_folder": component.src,
        "bucket_name": bucket_name,
    }
    component.images = await component.QASM.call_backend(window, function_names.LOAD_IMAGES, params);
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
 * @param {string} bucket_name bucket name
 */
export async function loadImageDir(window, component, bucket_name = undefined) {
    if (component.src !== undefined) {
        component.image_stack = []; // Clear image stack on new directory load
        if (component.autoload_labels_on_dir_select !== undefined && component.autoload_labels_on_dir_select) {
            autoLoadLabels(window, component, bucket_name); // Try and autoload labels
        }
        autoLoadImageLayers(window, component); // Try and autoload image layers
        await loadImages(window, component, bucket_name); // Load images
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
export async function selectImageDir(window, component, start_folder = undefined, bucket_name = undefined) {
    let params = {
        "start_folder": start_folder !== undefined ? start_folder : component.src,
        "bucket_name": bucket_name,
    }
    let dir_path = await component.QASM.call_backend(window, function_names.OPEN_DIR_DIALOG, params);
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
export async function loadLabels(window, component, loadnames = undefined, start_folder = undefined, bucket_name = undefined) {
    let params = {
        // Start at start_folder, or one folder up from the current directory
        start_folder: start_folder !== undefined ? start_folder : getOneFolderUp(component.src),
        bucket_name: bucket_name,
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
 * @param {string} bucket_name bucket name
 */
export async function autoLoadLabels(window, component, bucket_name = undefined) {
    if (component.label_loadnames !== undefined) {
        // Wait for previous window to close
        setTimeout(() => {
            loadLabels(window, component, component.label_loadnames, undefined, bucket_name);
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
 * @param {string} start_folder folder to start in; defaults to one folder up from the current directory
 * @param {string} bucket_name bucket name
 */
export async function saveLabels(window, component, savename = "", start_folder = undefined, bucket_name = undefined) {
    // Use label format of the current page
    component.updateLocalLabels();
    let params = {
        labels: component.labels,
        // Start one folder up from the current directory
        start_folder: start_folder !== undefined ? start_folder : getOneFolderUp(component.src),
        bucket_name: bucket_name,
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
    let dir_path = await component.QASM.call_backend(window, function_names.OPEN_DIR_DIALOG, {"start_folder": component.src});
    console.log(dir_path);

    // Load images and add them to the image stack
    let image_layer = await component.QASM.call_backend(window, function_names.LOAD_IMAGES, {"start_folder": dir_path});
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
        let new_image_stack = [];
        for (let folder_name_group of component.image_layer_folder_names) {
            // See if the current folder is in any of the groups, and if so, use that group
            if (folder_name_group.includes(current_folder)) {
                new_image_stack = await getImageStack(component, root_dir, current_folder, folder_name_group);
            }
        }

        // If we didn't find the current folder in any of the groups, try all groups
        if (new_image_stack.length === 0) {
            for (let folder_name_group of component.image_layer_folder_names) {
                new_image_stack = await getImageStack(component, root_dir, current_folder, folder_name_group);
                // Once we have all the layers, stop
                if (new_image_stack.length === n_layers) {
                    break;
                }
            }
        }

        // Set the new image stack
        component.image_stack = new_image_stack;
        console.log("final stack:", component.image_stack);
        updateState(component);
    }
}


/**
 * Helper function for autoLoadImageLayers. Try and load image
 * layers from a group of folder names.
 * 
 * @param {object} component component that called the function
 * @param {string} root_dir src directory of the current component
 * @param {Array[string]} folder_name_group Array of folder names to try and load
 * @returns {Array} image stack; array of image layers
 */
async function getImageStack(
    component,
    root_dir,
    current_folder,
    folder_name_group, 
) {
    let new_image_stack = [];
    // Try each group of folder names in order, skipping
    // any that result in empty layers
    for (let folder_name of folder_name_group) {
        // Skip the current folder
        if (folder_name === current_folder) {
            continue;
        }
        // Load images and add them to the image stack
        let image_layer = await component.QASM.call_backend(window, function_names.LOAD_IMAGES, {"start_folder": getChildPath(root_dir, folder_name)});
        if (Object.keys(image_layer).length === 0) {
            console.log("Prevent adding empty layer, skipping to next folder group.");
            new_image_stack = []; // Clear image stack to allow next group to try and load
            return new_image_stack;
        } else {
            new_image_stack.push(image_layer);
        }
        console.log(new_image_stack);
    }
    return new_image_stack;
}

/**
 * Show or hide the center line for an image
 * 
 * @param {*} document document object
 * @param {string} hover_image_id id of the current image
 */
export function toggleCenterLine(document, hover_image_id) {
    if (hover_image_id === null) {
        return;
    }
    
    let center_line = document.getElementById(hover_image_id + "-center-line-overlay");
    center_line.classList.toggle("hidden");
}

/**
 * Show or hide all center lines for all images
 * 
 * @param {*} document 
 * @param {*} component 
 */
export function toggleAllCenterLines(document, component) {
    // Invert the center_lines_hidden state
    // If it was undefined it will be set to true
    component.center_lines_hidden = !Boolean(component.center_lines_hidden);
    const is_hidden = component.center_lines_hidden; // To shorten the variable name
    
    for (let image_name of component.image_names) {
        let center_line = document.getElementById(image_name + "-center-line-overlay");
        is_hidden ? center_line.classList.add("hidden") : center_line.classList.remove("hidden");
    }
}