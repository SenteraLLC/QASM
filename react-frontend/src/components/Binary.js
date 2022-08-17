import { Component } from "react";

const { Image } = require("image-js");

class Binary extends Component {
    currently_hovered = false;

    constructor(props) {
        super(props);
        this.original_binary = props.original_binary;

        if (this.original_binary !== undefined) {
            this.id = this.original_binary.split("/").pop()
        }


        // Bind this to each method
        this.handleMouseIn = this.handleMouseIn.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleKeypress = this.handleKeypress.bind(this);
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
            case "=":
                console.log("=")
                this.dilate();
                break;
            case "-":
                console.log("-")
                break;
            default:
                console.log("other")
        }
    }

    async dilate() {
        
        // Make sure we have a binary to work with.
        if (this.original_binary === undefined) return;

        let binary_image = await Image.load(document.querySelector("#output-" + this.id).src);

        binary_image.grey().mask();

        let new_binary_image = binary_image.dilate();

        document.querySelector("#output-" + this.id).src = new_binary_image.toDataURL();
    }

    render() {
        return (
            <div className="Binary" >
                <img 
                    src={this.original_binary} 
                    alt="Original Binary" 
                    id={this.original_binary !== undefined ? "original-" + this.id : null} 
                    className="input-binary"/>
                <img 
                    alt="Output Binary" 
                    id={this.original_binary !== undefined ? "output-" + this.id : null} 
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