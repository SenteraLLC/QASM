import { Component } from "react";
import "../css/Dropdown.css";

class Dropdown extends Component {
    invalid = false;
    invalid_props = [];
    rotate = false;
    DROPDOWN_CONTENT_TYPES = {
        BUTTON: "button",
        CHECKBOX: "checkbox",
    }

    constructor(props) {
        super(props);

        this.items                   = props.items;                  // Required
        this.callback                = props.callback;               // Required
        this.style                   = props.style;                  // Optional
        this.display_text            = props.display_text;           // Optional
        this.currently_selected      = props.currently_selected      // Optional {text: String, disable: Boolean}
        this.dropdown_content_type   = props.dropdown_content_type   // Optional
        this.checkbox_default_values = props.checkbox_default_values // Optional

        this.makeID                 = this.makeID.bind(this);
        this.ensureDropdownOnscreen = this.ensureDropdownOnscreen.bind(this);

        // Make sure that items both exists and is an array with at least one item
        try {
            if (this.items.constructor !== Array || this.items.length === 0) {
                this.invalid = true;
                this.invalid_props.push("props.items");
            }
        }
        catch {
            this.invalid = true;
            this.invalid_props.push("props.items");
        }

        // Ensure a callback was given
        if (!(this.callback instanceof Function)) {
            this.invalid = true;
            this.invalid_props.push("props.callback");
        }
        
        // Check if display text was given, if not use the default
        if (this.display_text === undefined) {
            this.display_text = "▶";
            this.rotate = true;
        }

        // If currently_selected wasn't given, set a default
        if (this.currently_selected === undefined) {
            this.currently_selected = {text: "", disable: false}
        }
        else {
            // If it was given ensure it has the required fields
            if (this.currently_selected.text === undefined) {
                this.invalid_props.push("currently_selected.text");
                this.invalid = true;
            }
            if (this.currently_selected.disable === undefined) {
                this.invalid_props.push("currently_selected.disable");
                this.invalid = true;
            }
        }

        // If dropdown_content_type wasn't given, set a default
        if (this.dropdown_content_type === undefined) {
            this.dropdown_content_type = "button";
        } else if (!(Object.values(this.DROPDOWN_CONTENT_TYPES).includes(this.dropdown_content_type))) {
            // If it was given ensure it has the required fields
            this.invalid_props.push("dropdown_content_type");
            this.invalid = true;
        }
    }


    /**
     * Takes in a list and concatonates all elements to be used as an id.
     * 
     * @param {string[]} items Options passed into the Dropdown component
     * @returns {string} Concatonates all elements in the array
     */
    makeID(items) {
        if (items.constructor !== Array || this.items.length === 0) return "";
        return items.join('-');
    }


    /**
     * Moves the dropdown back onto the screen, if it was off the right side of the screen.
     * Fixing it being off of the left side isn't implimented because that shouldn't happen.
     */
    ensureDropdownOnscreen() {
        // TODO: Better implimentation where the dropdown doesn't show in the incorrect place briefly the first time its shown.
        // Grab the dropdown component
        let dropdown = document.getElementById(this.makeID(this.items));

        // Get the dropdown's position
        const position = dropdown.getBoundingClientRect();

        // Check to see if the dropdown is off the right side of the page
        if (position.right >= (window.innerWidth || document.documentElement.clientWidth)) {
            // Move it left by how many pixels off of the page it was, plus an extra 3px of buffer to make it look nicer
            dropdown.style.left = ((window.innerWidth || document.documentElement.clientWidth) - position.right - 3) + "px";
        }
    }

    render() {
        if (this.invalid) {
            return (
                <div>
                    This component was either missing or given the following invalid props:
                    <br/>
                    {this.invalid_props.join(", ")}
                </div>
            )
        }
        return (
            <div className="Dropdown">
                <button className={this.rotate ? "toggle-display rotate" : "toggle-display"} onClick={this.ensureDropdownOnscreen}>
                    {this.display_text}
                </button>
                <div className="dropdown-content" id={this.makeID(this.items)}>
                    {/* Button */}
                    {this.dropdown_content_type === this.DROPDOWN_CONTENT_TYPES.BUTTON && this.items.map(option => (
                        <button 
                            onClick={() => this.callback(option)}
                            key={option}
                            disable={((this.currently_selected.text === option) && (this.disable).toString()).toString()}
                            style={{fontWeight: this.currently_selected.text === option ? "bold" : "normal"}}>
                            {option}
                        </button>
                    ))}
                    {/* Checkbox */}
                    {this.dropdown_content_type === this.DROPDOWN_CONTENT_TYPES.CHECKBOX && this.items.map(option => (
                        <div
                            key={option}
                            className="checkbox-container">
                            <input
                                type="checkbox"
                                id={option + "-checkbox"}
                                defaultChecked={option in this.checkbox_default_values && this.checkbox_default_values[option]}
                                onChange={(event) => this.callback(option, event.target.checked)}
                                disable={((this.currently_selected.text === option) && (this.disable).toString()).toString()}
                            >
                            </input>
                            <button 
                                // This button is used as a label for the checkbox, since htmlFor wasn't working
                                // TODO: make the button toggle the checkbox
                                className="checkbox-label"
                                key={option}
                                disable={((this.currently_selected.text === option) && (this.disable).toString()).toString()}
                                style={{fontWeight: this.currently_selected.text === option ? "bold" : "normal"}}
                            >
                                {option}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

export default Dropdown