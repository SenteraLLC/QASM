// ####GENERAL UTILS####

/**
 * Takes in a string and removes all non valid html id/class characters.
 * 
 * @param {string} input_string string to be converted into valid html id 
 * @returns {string} 
 */
export function string_to_vaild_css_selector(input_string) {
    // Every character that is not a-z A-Z 0-9 or a - gets replaced with ""
    // ^ means not, so everything that's not a-z0-9 or -
    // /g means upper and lower case a-z
    // /i means replace all instances, not just the first.
    input_string = input_string.replace(/[^a-z0-9-]/gi, "");
    return input_string
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

/**
 * Get the url for a new popup window.
 * @param {*} window window
 * @param {string} new_path desired path for new window
 * @returns {string} url for new window
 */
export function get_new_window_url(window, new_path) {
    // let rmv = window.location.href.split("/").slice(-1);
    // if (rmv[0] === "") {
    //     return window.location.href + new_path;
    // } else {
    //     return window.location.href.replace(rmv, new_path);
    // }

    // Memory Router in the .exe can break, so instead of going
    // to a relative path just always nav to the index.html
    return window.location.href;
}


/**
 * Find all positions of a character in a string.
 * 
 * @param {string} str string to search
 * @param {string} char character to find
 * @returns Array of indices of char in str
 */
export function charPos(str, char) {
    return str
           .split("")
           .map((c, i) => { if (c === char) return i; })
           .filter((v) => { return v >= 0; });
  }
  

  /**
   * Get the file path one folder up.
   * 
   * @param {string} file_path file path with trailing slash
   * @returns file path one folder up
   */
export function getOneFolderUp(file_path) {
    // Start at one folder level higher than the current directory
    // charPos finds all instances of a character in a string, then we take the second to last one
    // to get the second to last slash, which is the one before the current directory.
    // Then we add one to keep the trailing slash.
    return file_path.substring(0, charPos(file_path, "/").splice(-2)[0]+1);
}


/**
 * Get the current folder name from a file path.
 * 
 * @param {string} file_path file path with trailing slash 
 * @returns current folder name
 */
export function getCurrentFolder(file_path) {
    return file_path.split("/").slice(-2)[0]
}