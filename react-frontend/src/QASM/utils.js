// Utils

/**
 * Call a backend function and log the response
 * 
 * @param {*} window active window
 * @param {*} function_name function name listed in electron_constants.js
 * @param {*} data data to be sent to the backend
 */

/**
 * Takes in a string and converts it into a valid html id/class.
 * Currently it works for our use case, but we should change it to
 * convert any character into a unique representation of valid 
 * html characters instead.
 * 
 * @param {string} file_name string to be converted into valid html id 
 * 
 * @returns {string} 
 */
export function file_name_to_valid_id(file_name) {
    file_name = file_name.replaceAll("_", "-")
    let valid_name = file_name.substring(0, file_name.indexOf('.'));
    return valid_name
}

/**
 * Updates all of the overlays to be the same size as their image.
 */
export function update_all_overlays() {
    let all_overlays = document.getElementsByClassName("overlay")
    // Just in case this runs before the overlays are added to the dom
    if (all_overlays.length === 0) {
        return true
    }

    // Loop through every overlay and resize them to fit on their image
    for (let current_overlay of all_overlays) {
        
        // Grab the current overlay's sibling image until image loads
        let image = current_overlay.nextElementSibling;
        
        if (image.clientHeight === 0) {
            return false
        }
        // Set the overlay's width and height to the image's displayed width and height
        current_overlay.width  = image.clientWidth;
        current_overlay.height = image.clientHeight;
    }
    return true;
}

/**
 * Updates one overlay to be the same size as its image.
 * 
 * @param {string} overlay_id id of the overlay you want to update
 */
 export function update_overlay_by_id(overlay_id) {
    // Get the overlay by its id
    let overlay = document.getElementById(overlay_id)

    // Grab the element's parent
    let overlay_parent = overlay.parentElement;

    // Use the element's parent to get its siblings
    let overlay_siblings = overlay_parent.children;

    let image;

    // Loop through all of the sibling elements until you find the sibling that is currently displayed.
    for (let sibling of overlay_siblings) {

        // If the sibling is an overlay or hidden, then its not the sibling we want
        if (sibling.className.includes("hidden") || sibling.className.includes("overlay")) {
            continue
        } 

        // The current sibling is the image we're looking for
        image = sibling;
    }

    // Set the overlay's width and height to the image's displayed width and height
    overlay.width  = image.clientWidth;
    overlay.height = image.clientHeight;
}