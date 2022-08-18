import { Component } from "react";
import Binary from "./Binary";
import "../css/BinaryEditor.css";


class BinaryEditor extends Component {
    component_updater = 0;


    constructor(){
        super();

        // Bind function
        this.updateOriginalBinary = this.updateOriginalBinary.bind(this);

        // Keep track of original binary src in state so that we can rerender the dom
        // when original binary src changes
        this.state = {
            original_binary_src: this.original_binary_src
        }
    }

    /**
     * Creates and updates the src for the original binary from the input element on the page.
     */
    updateOriginalBinary() {
        // Grab the input
        let input = document.querySelector("#image_input");

        // Create a src for the image selected
        this.original_binary_src = URL.createObjectURL(input.files[0])

        // Set state and increment component updater to rerender the dom
        this.setState({
            original_binary_src: this.original_binary_src
        });
        this.component_updater++;
    }


    render() {
        return (
            <div className="BinaryEditor" key={this.component_updater}>
                {/* <button onClick={this.dilate}>
                    Dilate
                </button>
                <button onClick={this.erode}>
                    Erode
                </button> */}
                <input type="file" accept=".jpeg,.JPEG,.png,.PNG,.jpg,.JPG" id="image_input" onChange={this.updateOriginalBinary} />
                <Binary original_binary={this.original_binary_src}/>
            </div>
        )
    }
}

export default BinaryEditor