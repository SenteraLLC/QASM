import { Component } from "react";
import Binary from "./Binary";
import "../css/BinaryEditor.css";
const { function_names } = require("../../public/electron_constants.js");


class BinaryEditor extends Component {
    component_updater = 0;


    constructor(props){
        super(props);

        this.QASM = props.QASM;

        console.log(this.QASM, "this.QASM")

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


    async loadBinary() {
        let directory_path = await this.QASM.call_backend(window, function_names.OPEN_IMG);
        console.log(directory_path)

        if (directory_path !== undefined) {
            //document.querySelector("#test-img").src = directory_path
            this.original_binary_src = directory_path

            this.setState({
                original_binary_src: this.original_binary_src
            })
            this.component_updater++;
        }
        else {
            console.log("Prevented loading invalid directory.");
        }
    }


    async getBlob (fileUri) {
        const resp = await fetch(fileUri);
        const imageBody = await resp.blob();
        console.log("Imgae body", imageBody)
        return imageBody;
    };


    blobToBase64(blob) {
        return new Promise((resolve, _) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
    }


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
                    <button onClick={this.loadBinary}>
                        Select Binary
                    </button>
                )
                break;
            
            // Local will be the default
            case "local":
            default:
                select_image_button = (
                    <label htmlFor="image_input">
                        Select Binary
                    </label>
                )
                break;
        }

        return (
            <div className="BinaryEditor" key={this.component_updater}>
                <div className="button-holder">
                    {select_image_button}
                    <button onClick={this.saveBinary}>
                        Save New Binary
                    </button>
                    <button onClick={this.dilateBinary}>
                        Dilate
                    </button>
                    <button onClick={this.erodeBinary}>
                        Erode
                    </button>
                    <img id="test-img"></img>
                </div>
                <Binary 
                    original_binary={this.original_binary_src} 
                    dilate_keybind={this.dilate_keybind} 
                    erode_keybind={this.erode_keybind}/>
                <input 
                type="file" 
                accept=".jpeg,.JPEG,.png,.PNG,.jpg,.JPG" 
                id="image_input" 
                className="hidden"
                onChange={this.updateOriginalBinary} />
            </div>
        )
    }
}

export default BinaryEditor