import { Component } from "react";
import { string_to_vaild_css_selector } from "../QASM/utils";
import "../css/Binary.css";
const { init_keybinds, get_keybind_in_keypress_event } = require("../QASM/keybind_utils.js");
const { Image } = require("image-js");

const BINARY_KEYBIND_NAMES = {
    DILATE: "dilate_keybind",
    ERODE: "erode_keybind",
}

const BINARY_DEFAULT_KEYBINDS = {
    [BINARY_KEYBIND_NAMES.DILATE]: "=",
    [BINARY_KEYBIND_NAMES.ERODE]: "-",
}

let BINARY_KEYBINDS = JSON.parse(JSON.stringify(BINARY_DEFAULT_KEYBINDS));

class Binary extends Component {
    component_updater = 0;
    currently_hovered = false;
    operations = "";
    shown_operations = "";

    constructor(props) {
        super(props);
        this.original_binary_src = props.original_binary;

        // If custom keybinds are passed in use those, otherwise use default
        init_keybinds(props, BINARY_DEFAULT_KEYBINDS, BINARY_KEYBINDS);

        // The output binary is the same as the input binary until its modified
        this.output_binary_src = props.original_binary;

        // Only set the id if the original binary src isn't undefined
        if (this.original_binary_src !== undefined) {
            this.id = this.original_binary_src.split("/").pop()
            this.id = string_to_vaild_css_selector(this.id)
        }
        
        // Bind this to each method
        this.handleMouseIn  = this.handleMouseIn.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleKeypress = this.handleKeypress.bind(this);
        this.erode          = this.erode.bind(this);
        this.dilate         = this.dilate.bind(this);
        this.saveOperation  = this.saveOperation.bind(this);

        // Set state
        this.state = {
            output_binary_src: this.original_binary_src
        };
    }


    /**
     * Sets this.currently_hovered to true.
     */
    handleMouseIn() {
        this.currently_hovered = true;
    }


    /**
     * Sets this.currently_hovered to false.
     */
    handleMouseOut() {
        this.currently_hovered = false;
    }


    /**
     * Handles calling the correct morphological method on the output binary
     * if the mouse is currently hovering over the binary.
     * 
     * @param {Event} event Javascript event triggered on keypress
     */
    handleKeypress(event) {
        // Ignore all keypresses if the output binary is not being hovered
        if (!this.currently_hovered) return;

        switch(get_keybind_in_keypress_event(BINARY_KEYBINDS, event)) {
            case BINARY_KEYBIND_NAMES.DILATE:
                this.dilate();
                break;
            case BINARY_KEYBIND_NAMES.ERODE:
                this.erode();
                break;
            default:
        }
    }


    /**
    * Applies the dilate morphological operation on the output binary and updates its src.
    */
    async dilate() {
        // Make sure we have a binary to work with.
        if (this.output_binary_src === undefined) return;

        // Load the binary image we'll be working on.
        let binary_image = await Image.load(this.output_binary_src);

        // Convert it to a true binary
        binary_image = binary_image.grey().mask();

        // Apply dilate
        let new_binary_image = binary_image.dilate();

        // Put the new binary in the dom and set the state
        this.output_binary_src = new_binary_image.toDataURL();
        this.setState({
            output_binary_src: this.output_binary_src
        });

        // Save operation to the dom
        this.saveOperation("Dilate");
    }


    /**
     * Applies the erode morphological operation on the output binary and updates its src.
     */
    async erode() {
        // Make sure we have a binary to work with.
        if (this.output_binary_src === undefined) return;

        // Load the binary image we'll be working on.
        let binary_image = await Image.load(this.output_binary_src);
        // var binary_image = new Image();
        // binary_image.src = 'data:image/png;base64,iVBORw0K...';


        // Convert it to a true binary
        binary_image = binary_image.grey().mask();

        // Apply erode
        let new_binary_image = binary_image.erode();

        // Put the new binary in the dom and set the state
        this.output_binary_src = new_binary_image.toDataURL();
        this.setState({
            output_binary_src: this.output_binary_src
        });

        // Save operation to the dom
        this.saveOperation("Erode");
    }

    /**
     * Saves the operation used to the page both in a human readable way, and a hidden
     * machine readable way
     * 
     * @param {string} operation Name of the operation to be saved.
     */
    saveOperation(operation) {
        // First save it in a human readable way
        if (this.shown_operations === "") {
            this.shown_operations = this.shown_operations + operation;
        }
        else {
            this.shown_operations = this.shown_operations + "  →  " + operation;
        }

        // Then save just the first letter
        this.operations = this.operations + operation[0].toLowerCase();

        // Set the state to rerender
        this.setState({
            operations: this.operations,
            shown_operations: this.shown_operations
        });
        this.component_updater++;
    }


    render() {
        return (
            <div className="Binary" key={this.component_updater}>
                <img 
                    src={this.original_binary_src !== undefined ? this.original_binary_src : " "} 
                    alt="Original Binary" 
                    id={this.original_binary_src !== undefined ? "original-" + this.id : null} 
                    className="input-binary"/>
                <img 
                    src={this.output_binary_src !== undefined ? this.output_binary_src : " "}
                    alt="Output Binary" 
                    id={this.original_binary_src !== undefined ? "output-" + this.id : null} 
                    className="output-binary" 
                    onMouseEnter={this.handleMouseIn} 
                    onMouseOut={this.handleMouseOut}/>
                <button className="binary-dilate hidden" onClick={this.dilate}>
                    This should be hidden by css.
                    These button are here to allow you to call the dilate and erode 
                    methods from outside of this component by selecting this element
                    and using Javascript to click it.
                </button>
                <button className="binary-erode hidden" onClick={this.erode}>
                    This should be hidden by css.
                    These button are here to allow you to call the dilate and erode 
                    methods from outside of this component by selecting this element
                    and using Javascript to click it.
                </button>
                <p 
                    className="operations" 
                    id={this.original_binary_src !== undefined
                        ? "operations-" + string_to_vaild_css_selector(this.original_binary_src)
                        : null
                    }
                >
                    {this.shown_operations}
                </p>
                <p 
                    className="operations-hidden hidden" 
                    id={this.original_binary_src !== undefined
                        ? "operations-hidden-" + string_to_vaild_css_selector(this.original_binary_src)
                        : null
                    }
                >
                    {this.operations}
                </p>
            </div>
        );
    }


    componentDidMount() {
        document.addEventListener("keydown", this.handleKeypress.bind(this));
    }


    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeypress.bind(this));
    }
}

export default Binary;