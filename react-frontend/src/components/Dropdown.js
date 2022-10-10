import { Component } from "react";
import "../css/Dropdown.css";

class Dropdown extends Component {
    invalid = false;
    invalid_props = [];
    rotate = false;

    constructor(props) {
        super(props);

        this.items              = props.items;             // Required
        this.callback           = props.callback;          // Required
        this.style              = props.style;             // Optional
        this.display_text       = props.display_text;      // Optional
        this.currently_selected = props.currently_selected // Optional {text: String, disable: Boolean}

        this.makeID = this.makeID.bind(this);

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

        if (this.currently_selected === undefined) {
            this.currently_selected = {text: "", disable: false}
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


    render() {
        if (this.invalid) {
            return (
                <div>
                    This component was either missing or given the following invalid props:
                    <br/ >
                    {this.invalid_props}
                </div>
            )
        }
        return (
            <div className="Dropdown" style={{marginLeft:"40em"}}>
                <button className={this.rotate ? "toggle-display rotate" : "toggle-display"}>
                    {this.display_text}
                </button>
                <div className="dropdown-content" id={this.makeID(this.items)}>
                    {this.items.map(option => (
                        <button 
                            onClick={() => this.callback(option)}
                            key={option}
                            disable={(this.currently_selected.text === option) && (this.disable)}
                            style={{fontWeight: this.currently_selected.text === option ? "bold" : "normal"}}>
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    componentDidMount() {
        const client_width = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    }
}

export default Dropdown