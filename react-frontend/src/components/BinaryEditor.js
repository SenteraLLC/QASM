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

        // Bind functions
        this.updateOriginalBinary = this.updateOriginalBinary.bind(this);
        this.loadBinary           = this.loadBinary.bind(this);
        this.saveBinary           = this.saveBinary.bind(this);

        // Keep track of original binary src in state so that we can rerender the dom
        // when original binary src changes
        this.state = {
            original_binary_src: this.original_binary_src
        }
    }


    /**
     * Calls the QASM backend to load in a binary.
     * If it loads, set the original binary src to the binary.
     */
    async loadBinary() {
        let directory_path = await this.QASM.call_backend(window, function_names.OPEN_IMG);

        if (directory_path !== undefined) {
            this.original_binary_src = directory_path

            // Update the state and the component updater to get the component to rerender
            this.setState({
                original_binary_src: this.original_binary_src
            })
            this.component_updater++;
        }
        else {
            console.log("Prevented loading invalid directory.");
        }
    }

    /**
     * Converts a file uri string to a blob.
     * 
     * @param {string} fileUri Uri of the image to be saved.
     * @returns {Blob} A Blob of the uri
     */
    async getBlob (fileUri) {
        const resp = await fetch(fileUri);
        const imageBody = await resp.blob();
        console.log("Imgae body", imageBody)
        return imageBody;
    };

    /**
     * Converts a Blob to an base 64 string.
     * 
     * @param {Blob} blob An image blob.
     * @returns {string} A base 64 string.
     */
    blobToBase64(blob) {
        return new Promise((resolve, _) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
    }


    /**
     * Grabs the output binary from the page and calls the QASM backend to save the file.
     */
    async saveBinary() {
        let output_binary = document.querySelector(".output-binary");

        let blob = await this.blobToBase64(await this.getBlob(output_binary.src));

        console.log(await this.QASM.call_backend(window, function_names.SAVE_IMAGE, blob))
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
        // Create the Upload Binary button based on the QASM mode
        let select_image_button;
        switch (this.QASM.mode) {
            case "s3":
                select_image_button = (
                    <button className="button" onClick={this.loadBinary}>
                        Select Binary
                    </button>
                )
                break;
            
            // Local will be the default
            case "local":
            default:
                select_image_button = (
                    <div>
                        <label className="button" htmlFor="image_input">
                            Select Binary
                        </label>
                        <input 
                            type="file" 
                            accept=".jpeg,.JPEG,.png,.PNG,.jpg,.JPG" 
                            id="image_input" 
                            className="hidden"
                            onChange={this.updateOriginalBinary} />
                    </div>
                )
                break;
        }

        return (
            <div className="BinaryEditor" key={this.component_updater}>
                <div className="button-holder">
                    {select_image_button}
                    <button className="button" onClick={this.saveBinary}>
                        Save New Binary
                    </button>
                    <button className="button" onClick={this.dilateBinary}>
                        Dilate
                    </button>
                    <button className="button" onClick={this.erodeBinary}>
                        Erode
                    </button>
                </div>
                <Binary 
                    original_binary={this.original_binary_src} 
                    dilate_keybind={this.dilate_keybind} 
                    erode_keybind={this.erode_keybind}/>
            </div>
        )
    }
}

export default BinaryEditor