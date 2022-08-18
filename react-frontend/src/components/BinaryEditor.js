import { Component } from "react";
import Binary from "./Binary";
import "../css/BinaryEditor.css";


class BinaryEditor extends Component {
    component_updater = 0;


    constructor(props){
        super(props);

        // Save these so we can pass them into the Binary
        this.dilate_keybind = props.dilate_keybind;
        this.erode_keybind = props.erode_keybind;

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
                <div className="button-holder">
                    <label for="image_input">
                        Upload Binary
                    </label>
                    <button onClick={this.dilate}>
                        Dilate
                    </button>
                    <button onClick={this.erode}>
                        Erode
                    </button>
                </div>
                <Binary 
                    original_binary={this.original_binary_src} 
                    dilate_keybind={this.dilate_keybind} 
                    erode_keybind={this.erode_keybind}/>
                <input type="file" accept=".jpeg,.JPEG,.png,.PNG,.jpg,.JPG" id="image_input" onChange={this.updateOriginalBinary} />
            </div>
        )
    }
}

export default BinaryEditor