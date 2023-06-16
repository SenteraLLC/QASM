// ####GRID UTILS####
import $ from "jquery";

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