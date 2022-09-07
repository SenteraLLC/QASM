import { Component } from "react";
import { string_to_vaild_css_selector } from "../QASM/utils";
import "../css/Binary.css";

const { Image } = require("image-js");

class Binary extends Component {
    currently_hovered = false;


    constructor(props) {
        super(props);
        this.original_binary_src = props.original_binary;

        // If custom keybinds are passed in use those, otherwise use default
        this.dilate_keybind = props.dilate_keybind || "=";
        this.erode_keybind = props.erode_keybind || "-";

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

        switch(event.key) {
            case this.dilate_keybind:
                this.dilate();
                break;
            case this.erode_keybind:
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
    }


    /**
     * Applies the erode morphological operation on the output binary and updates its src.
     */
    async erode() {
        // Make sure we have a binary to work with.
        if (this.output_binary_src === undefined) return;

        // Load the binary image we'll be working on.
        let binary_image = await Image.load(this.output_binary_src);

        // Convert it to a true binary
        binary_image = binary_image.grey().mask();

        // Apply erode
        let new_binary_image = binary_image.erode();

        // Put the new binary in the dom and set the state
        this.output_binary_src = new_binary_image.toDataURL();
        this.setState({
            output_binary_src: this.output_binary_src
        });
    }

    /**
     * Saves the operation used to the page both in a human readable way, and a hidden
     * machine readable way
     * 
     * @param {string} operation Name of the operation to be saved.
     */
    saveOperation(operation) {

    }


    render() {
        return (
            <div className="Binary" >
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
                        ? string_to_vaild_css_selector(this.original_binary_src)
                        : null
                    }
                >
                </p>
                <p 
                    className="operations-hidden hidden" 
                    id={this.original_binary_src !== undefined
                        ? string_to_vaild_css_selector(this.original_binary_src)
                        : null
                    }
                >

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