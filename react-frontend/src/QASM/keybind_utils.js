// Utils for keybinds

// Keybinds are stored in the following format:
// {<string keybind_name>: <string keybind> or Array[<string keybind1>, <string keybind2>], ...}

// Example:
// {
//     "move_up": "w",
//     "move_down": "s",
//     "move_left": "a",
//     "move_right": "d",
//     "save": ["ctrlKey", "s"],
// }
// The "control", "shift", and "alt" keys are represented by "ctrlKey", "shiftKey", and "altKey", 
// since that is how they are represented in the keydown event.

const BOOLEAN_KEYBINDS = [
    "shiftKey",
    "ctrlKey",
    "altKey",
];

/**
 * Initialize the keybinds with the default keybinds 
 * or the user defined keybinds.
 * 
 * @param {object} user_keybinds user keybind preferences {<string keybind_name>: <string keybind> or Array[<string keybind1>, <string keybind2>], ...}
 * @param {object} default_keybinds keybind defaults {<string keybind_name>: <string keybind> or Array[<string keybind1>, <string keybind2>], ...}
 * @param {object} keybinds keybinds to initialize {<string keybind_name>: <string keybind> or Array[<string keybind1>, <string keybind2>], ...}
 */
export function init_keybinds(user_keybinds, default_keybinds, keybinds) {
    for (let [keybind_name, default_keybind] of Object.entries(default_keybinds)) {
        // If the user defined a keybind, use it instead of the default
        if (keybind_name in user_keybinds) {
            keybinds[keybind_name] = user_keybinds[keybind_name];
        } else {
            keybinds[keybind_name] = default_keybind;
        }
    }
}


/**
 * Return a keybind name when the keybind is pressed.
 * For use in a switch statement to handle keybinds.
 * When a valid keybind is pressed, any default event is prevented.
 * 
 * @param {object} keybinds {<string keybind_name>: <string keybind> or Array[<string keybind1>, <string keybind2>], ...}
 * @param {object} event Keydown event
 * @returns {string} Keybind name, or null if no keybind was pressed
 */
export function get_keybind_in_keypress_event(keybinds, event) {
    for (let [keybind_name, keybind] of Object.entries(keybinds)) {
        if (keybind_in_keypress_event_helper(keybind, event)) {
            event.preventDefault();
            return keybind_name;
        }
    }
    return null;
}


/**
 * Helper function for keybind_in_keypress_event.
 * 
 * @param {Array} keybind Keybind to check for. Can be a single string or an array of keybind strings.
 * @param {object} event Keydown event
 * @returns {boolean} True if the keybind(s) are present in the event, false otherwise.
 */
function keybind_in_keypress_event_helper(keybind, event) {
    if (Array.isArray(keybind)) {
        for (let i = 0; i < keybind.length; i++) {
            if (!keybind_in_keypress_event_helper(keybind[i], event)) {
                return false;
            }
        }
        return true;
    } else {
        // Check if the keybind is a boolean keybind (ctrl, shift, alt)
        // if so, event[keybind] will be `true` if the key is pressed
        if (BOOLEAN_KEYBINDS.includes(keybind)) {
            return event[keybind];   
        } else {
            return event.key === keybind;
        }
    }
}