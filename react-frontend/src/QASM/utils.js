// #### GENERAL UTILS ####

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
 * Assumes that the component has an image_names property, and that
 * each image has an overlay with the id of image_name + "-overlay".
 * 
 * @param {Component} component component that called this function: pass in `this` 
 * @returns {boolean} true if successful, false if not
 */
export function update_all_overlays(component) {
    try {
        for (let image_name of component.image_names) {
            update_overlay_by_id(image_name + "-class-overlay");
        }
        return true;
    } catch (error) {
        console.error("Error updating overlays: ", error);
        return false;
    }
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
 * Replace all backslashes with forward slashes and add a trailing slash if there isn't one.
 * 
 * @param {string} file_path file path
 * @returns [string file_path, boolean did_change]
 */
export function backslash_to_forwardslash(file_path) {
    // Replace all backslashes with forward slashes
    let ret = file_path.replaceAll("\\", "/")
    let did_change = ret !== file_path
    // Add a trailing slash if there isn't one
    ret += ret.endsWith("/") ? "" : "/"
    return [ret, did_change]
}


/**
 * Replace all forward slashes with backslashes and remove a trailing slash if there is one.
 * 
 * @param {string} file_path file path 
 * @returns [string file_path, boolean did_change]
 */
export function forwardslash_to_backslash(file_path) {
    // Replace all forward slashes with backslashes
    let ret = file_path.replaceAll("/", "\\")
    let did_change = ret !== file_path
    // Remove a trailing slash if there is one
    ret = ret.endsWith("\\") ? ret.slice(0, -1) : ret
    return [ret, did_change]
}
    

  /**
   * Get the file path one folder up.
   * 
   * @param {string} file_path file path with trailing slash
   * @returns file path one folder up
   */
export function getOneFolderUp(og_file_path) {
    // Handle backslashes in the file path
    let [file_path, did_change] = backslash_to_forwardslash(og_file_path)
    
    // Returns everything before the second to last "/". Then add an additional "/" to make it a path
    // the regex returns an array, and what we want is the first capture group
    let ret = /((?:.|\s)*)(?:\/[^\/]*){2}$/gm.exec(file_path)[1] + "/"
    
    // If the file path had backslashes, then convert the forward slashes back to backslashes
    if (did_change) {
        ret = forwardslash_to_backslash(ret)[0]
    }

    return ret
}


/**
 * Get the current folder name from a file path.
 * 
 * @param {string} file_path file path with trailing slash 
 * @returns current folder name
 */
export function getCurrentFolder(og_file_path) {
    // Handle backslashes in the file path
    let [file_path, did_change] = backslash_to_forwardslash(og_file_path)

    // Get the current folder name
    let ret = file_path.split("/").slice(-2)[0]

    // If the file path had backslashes, then convert the forward slashes back to backslashes
    if (did_change) {
        ret = forwardslash_to_backslash(ret)[0]
    }

    return ret
}


/**
 * Get the child path from a file path.
 * 
 * @param {string} og_file_path file path with trailing slash
 * @param {string} child_name child name
 * @returns {string} child path
 */
export function getChildPath(og_file_path, child_name) {
    // Handle backslashes in the file path
    let [file_path, did_change] = backslash_to_forwardslash(og_file_path)

    // Get the current folder name
    let ret = file_path + child_name

    // If the file path had backslashes, then convert the forward slashes back to backslashes
    if (did_change) {
        ret = forwardslash_to_backslash(ret)[0]
    }

    return ret
}