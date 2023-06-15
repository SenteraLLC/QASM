// ####GRID UTILS####
import $ from "jquery";

// TODO: keyboard shortcuts in config and loaded somewhere

/**
 * Scroll page to the next row 
 * 
 * @param {*} component component that called this function: pass in `this`
 * @param {string} hover_row_id id of the current row
 * @param {string} key current keypress
 */
export function autoScroll(component, hover_row_id, key) {
    let keypress = false;
    let row_not_found = true;
    switch (key) {
        case "n":
            let jquery_next_row = $("#" + hover_row_id); // Start at current row
            let next_row;
            while (row_not_found) {
                // Try the next row
                jquery_next_row = jquery_next_row.next();
                next_row = document.getElementById(jquery_next_row.attr("id"))
                // Each row is a tr element with td children
                for (let td of next_row.children) {
                    // Each td contains a MultiClassGridImage
                    // if any image is NOT hidden, we can scroll to it
                    if (!td.children[0].classList.contains("hidden")) {
                        // We found a row to scroll to
                        row_not_found = false;
                        break;
                    }
                }
            }
            // Scroll to next row
            $(document).scrollTop(jquery_next_row.offset().top);
            // Set next row as hovered for consecutive navigation
            component.hover_row_id = jquery_next_row.attr("id");
            keypress = true;
            break;
        case "h":
            let jquery_prev_row = $("#" + hover_row_id); // Start at current row
            let prev_row;
            while (row_not_found) {
                // Try the previous row
                jquery_prev_row = jquery_prev_row.prev();
                prev_row = document.getElementById(jquery_prev_row.attr("id"))
                // Each row is a tr element with td children
                for (let td of prev_row.children) {
                    // Each td contains a MultiClassGridImage
                    // if any image is NOT hidden, we can scroll to it
                    if (!td.children[0].classList.contains("hidden")) {
                        // We found a row to scroll to
                        row_not_found = false;
                        break;
                    }
                }
            }
            // Scroll to next row
            $(document).scrollTop(jquery_prev_row.offset().top);
            // Set previous row as hovered for consecutive navigation
            component.hover_row_id = jquery_prev_row.attr("id");
            keypress = true;
            break;
        default:
            break;
    }

    // Set new image as hovered
    if (keypress && component.hover_image_id !== null) {
        let row = parseInt(hover_row_id.slice(4)); // Row index
        let col = component.grid_image_names[row].indexOf(component.hover_image_id) // Col
        row = parseInt(component.hover_row_id.slice(4)); // New row index
        component.hover_image_id = component.grid_image_names[row][col]; // Set new image as hovered
        component.allow_next_scroll = true; // Override scroll protection
    }
}