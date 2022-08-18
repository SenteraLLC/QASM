import { Component } from "react";
import Binary from "./Binary";
import "../css/BinaryEditor.css";
const { function_names } = require("../../public/electron_constants.js");


class BinaryEditor extends Component {
    component_updater = 0;


    constructor(props){
        super(props);

        this.QASM = props.QASM;

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


    async saveBinary() {
        // TODO: save
        // const output_binary = document.querySelector(".output-binary");



        // console.log(await this.QASM.call_backend(window, function_names.SAVE_FILE, this.labels));
    }


    /**
     * Runs the dilate method from the Binary component by clicking a hidden button
     * in the component that runs the dilate method on click.
     */
    dilateBinary() {
        let dilate_button_list = document.getElementsByClassName("binary-dilate");

        for(let button of dilate_button_list) {
            button.click();
        }
    }


    /**
     * Runs the dilate method from the Binary component by clicking a hidden button
     * in the component that runs the dilate method on click.
     */
    erodeBinary() {
        let erode_button_list = document.getElementsByClassName("binary-erode");

        for(let button of erode_button_list) {
            button.click();
        }
    }


    render() {
        return (
            <div className="BinaryEditor" key={this.component_updater}>
                <div className="button-holder">
                    <label for="image_input">
                        Upload Binary
                    </label>
                    <button onClick={this.saveBinary}>
                        Save New Binary
                    </button>
                    <button onClick={this.dilateBinary}>
                        Dilate
                    </button>
                    <button onClick={this.erodeBinary}>
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