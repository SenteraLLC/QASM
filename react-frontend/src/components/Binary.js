import { Component } from "react";

const { Image } = require("image-js");

class Binary extends Component {
    currently_hovered = false;

    constructor(props) {
        super(props);
        this.original_binary_src = props.original_binary;

        // The output binary is the same as the input binary until its modified
        this.output_binary_src = props.original_binary;

        // Only set the id if the original binary src isn't undefined
        if (this.original_binary_src !== undefined) {
            this.id = this.original_binary_src.split("/").pop()
        }
        
        // Bind this to each method
        this.handleMouseIn = this.handleMouseIn.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleKeypress = this.handleKeypress.bind(this);

        // Set state
        this.state = {
            output_binary_src: this.original_binary_src
        }
    }

    // static getDerivedStateFromProps(props, state) {

    // }

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
            case "=":
                console.log("=")
                this.dilate();
                break;
            case "-":
                this.erode();
                break;
            default:
                console.log("other")
        }
    }

     /**
     * Applies the dilate morphological operation on the output binary and replaces it in the dom.
     */
    async dilate() {
        
        // Make sure we have a binary to work with.
        if (this.output_binary_src === undefined) return;

        // Load the binary image we'll be working on.
        let binary_image = await Image.load(this.output_binary_src);

        // Convert it to a true binary
        binary_image = binary_image.grey().mask();
        console.log(binary_image)

        // Apply dilate
        let new_binary_image = binary_image.dilate();

        // Put the new binary in the dom and set the state
        this.output_binary_src = new_binary_image.toDataURL();
        this.setState({
            output_binary_src: this.output_binary_src
        });
    }

    /**
     * Applies the erode morphological operation on the output binary and replaces it in the dom.
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

    render() {
        return (
            <div className="Binary" >
                <img 
                    src={this.original_binary_src} 
                    alt="Original Binary" 
                    id={this.original_binary_src !== undefined ? "original-" + this.id : null} 
                    className="input-binary"/>
                <img 
                    src={this.output_binary_src}
                    alt="Output Binary" 
                    id={this.original_binary_src !== undefined ? "output-" + this.id : null} 
                    className="output-binary" 
                    onMouseEnter={this.handleMouseIn} 
                    onMouseOut={this.handleMouseOut}/>
            </div>
        );
    }

    componentDidMount() {
        // document.addEventListener("mousemove", this.handleMousemove(this));
        document.addEventListener("keydown", this.handleKeypress.bind(this));
    }

    componentWillUnmount() {
        // document.removeEventListener("mousemove", this.handleMousemove(this));
        document.removeEventListener("keydown", this.handleKeypress.bind(this));
    }
}

export default Binary;