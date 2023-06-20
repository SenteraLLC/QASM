// ####GRID UTILS####
import $ from "jquery";
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
    component.clearAll();
    // Set the images shown to true now that the images are shown
    component.images_shown = true;
}