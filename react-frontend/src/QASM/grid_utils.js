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
    if (key === "n") {
        // Scroll to next row
        $(document).scrollTop($("#" + hover_row_id).next().offset().top);
        // Set next row as hovered for consecutive navigation
        component.hover_row_id = $("#" + hover_row_id).next()[0].id;
    } else if (key === "h") {
        // Scroll to previous row
        $(document).scrollTop($("#" + hover_row_id).prev().offset().top);
        // Set previous row as hovered for consecutive navigation
        component.hover_row_id = $("#" + hover_row_id).prev()[0].id;
    }

    // Set new image as hovered
    if (component.hover_image_id != null) {
        let row = parseInt(hover_row_id.slice(4)); // Row index
        let col = component.grid_image_names[row].indexOf(component.hover_image_id) // Col
        row = parseInt(component.hover_row_id.slice(4)); // New row index
        component.hover_image_id = component.grid_image_names[row][col]; // Set new image as hovered
        component.allow_next_scroll = true; // Override scroll protection
    }
}