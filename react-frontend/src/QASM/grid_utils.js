// ####GRID UTILS####
import $ from "jquery";
const { getOneFolderUp } = require("./utils.js");
const { function_names } = require("../../public/electron_constants.js");

// TODO: keyboard shortcuts in config and loaded somewhere

/**
 * Scroll page to the next row 
 * 
 * @param {*} component component that called this function: pass in `this`
 * @param {string} hover_image_id id of the current row
 * @param {string} key current keypress
 */
export function autoScroll(component, hover_image_id, key) {
    let row_not_found = true;
    switch (key) {
        case "n": // Next row
        case "h": // Previous row
            let jquery_next_image = $("#" + hover_image_id); // Start at current row
            let current_top = jquery_next_image.offset().top; // Top of current row
            let next_image;
            while (row_not_found) {
                // Try the next (or previous) image
                jquery_next_image = key === "n" ? jquery_next_image.next() : jquery_next_image.prev();
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
            break;
        default:
            break;
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
    // firstChild = image holder div
    // childNodes of image holder div = image layers

    let layers = document.getElementById(hover_image_id).firstChild.childNodes;
    console.log(layers);
    // layers[0] is the image, layers[n] is image_stack[n-1], layers[layers.length-1] is the class-overlay
    for (let idx = 0; idx < layers.length; idx++) {
        let layer = layers[idx];
        // Skip overlays and hidden images
        if (layer.id.includes("overlay") || layer.classList.contains("hidden")) {
            continue;
        }

        // Change currently shown image to hidden
        layer.classList.add("hidden");
        console.log("Hiding " + layer.id)

        // Change next hidden image to shown
        if (idx + 1 === layers.length - 1) {
            // Last index is the class-overlay
            // If we're at the last layer, turn on the og image
            layers[0].classList.remove("hidden");
            console.log("Showing " + layers[0].id)
        } else {
            // Un-hide next image
            layers[idx + 1].classList.remove("hidden");
            console.log("Showing " + layers[idx + 1].id)
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
    let labels = await component.QASM.call_backend(window, function_names.LOAD_LABELS, params);
    component.labels = initLabels(component, labels);
    console.log(component.labels);

    if (Object.keys(component.labels).length > 0) {
        component.updateState(); // Update state to rerender page
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

    await component.QASM.call_backend(window, function_names.SAVE_JSON_FILE, params);
}


/**
 * Clear all the current labels
 * 
 * @param {*} component component that called this function: pass in `this`
 */
export function clearAllLabels(component) {
    // Set all classes to the default
    component.labels = initLabels(component);
    component.updateState();
}