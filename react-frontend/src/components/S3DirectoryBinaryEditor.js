import { Component } from "react";
import Binary from "./Binary";
import { function_names } from "../../public/electron_constants";
import "../css/S3DirectoryBinaryEditor.css";

/**
 * Creates a component for editing all binaries in an s3 folder.
 */
class S3DirectoryBinaryEditor extends Component {
    component_updater = 0;
    destination_path = "";

    constructor(props) {
        super()
        this.QASM = props.QASM;

        // Bind functions
        this.loadDirectory  = this.loadDirectory.bind(this);
        this.loadFirstImage = this.loadFirstImage.bind(this);
        this.loadNextImage  = this.loadNextImage.bind(this);
        this.save           = this.save.bind(this);
    }


    /**
     * Uses the QASM backend to select a directory from S3 then creates a dictonary where the image
     * name is the key and the image url is the value. Finally loads in the first image to be viewed.
     */
    async loadDirectory() {
        this.directory_path = await this.QASM.call_backend(window, function_names.OPEN_DIR_DIALOG);

        if (this.directory_path !== undefined) {

            // Create a dictionary for every image in the directory where the image name is
            // the key and the path is the value
            this.images = await this.QASM.call_backend(window, function_names.LOAD_BASE64_IMAGES, this.directory_path);

            // Create a list of keys
            this.images_keys = Object.keys(this.images).sort();

            // Load the first image
            this.loadFirstImage();
        }
    }


    /**
     * Sets the first image in the images dictionary to be shown on the page.
     */
    loadFirstImage() {
        // Set the src to the first image key
        this.src = this.images[this.images_keys[0]];
        
        // Reset current image
        this.current_image = 0;

        // Update the state and component_updater so the component rerenders
        this.setState({
            src: this.src
        });
        this.component_updater++;
    }


    /**
     * Checks which image is currently being shown in from the images dictionary and displays the
     * next image.
     */
    loadNextImage() {
        // Increment the current image
        this.current_image++;

        // If the current image is greater than the number of images, reset it to 0
        if (this.current_image >= this.images_keys.length) {
            this.current_image = 0;
        }

        // Set the src to the new image
        this.src = this.images[this.images_keys[this.current_image]];

        // Update the state and component_updater so the component rerenders
        this.setState({
            src: this.src
        });
        this.component_updater++;
    }

    
    /**
     * Prompts the user to ask if they're sure they want to save. If yes, calls the QASM backend to create
     * a new directory and a copy of each binary with the correct morphological operations applied to it.
     */
    async save() {
        // Saving cannot happen if no directory path is selected
        if (this.directory_path === undefined) {
            alert("You cannot save with no directory selected");
            return;
        }
        
        // Grab the morphological operations
        const operations = document.querySelector(".operations-hidden").innerHTML;

        // Saving cannot happen if no morphological operations have been performed
        if (operations === "") {
            alert("You cannot save without performing at least one morphological operation");
            return;
        }

        // Prompt the user if they want to save, if not then return wihout saving
        if (!window.confirm("Are you sure you want to save?")) return;

        const data = {
            operations: operations,
            src_dir: this.directory_path,
            dest_dir: this.destination_path,
        }

        // Have the backend apply the binary operations to every image in the directory, and
        // save it in a new folder
        alert(await this.QASM.call_backend(window, function_names.SAVE_BINARY_DIRECTORY, data))
    }


    /**
     * Runs the dilate method from the Binary component by clicking a hidden button
     * in the component that runs the dilate method on click.
     */
    dilateBinary() {
        let dilate_button_list = document.getElementsByClassName("binary-dilate");

        for (let button of dilate_button_list) {
            button.click();
        }
    }
    
    
    /**
     * Runs the dilate method from the Binary component by clicking a hidden button
     * in the component that runs the dilate method on click.
     */
    erodeBinary() {
        let erode_button_list = document.getElementsByClassName("binary-erode");

        for (let button of erode_button_list) {
            button.click();
        }
    }


    render() {
        if (this.QASM.mode !== "s3") {
            return (
                <div>
                    This component can only be used in S3 mode. 
                </div>
            )
        }
        return (
            <div className="S3DirectoryBinaryEditor" key={this.component_updater}>
                <header className={this.directory_path === undefined ? "one" : "five"}>
                    <button className="button" onClick={this.loadDirectory}>
                        Select Directory
                    </button>
                    <button className={this.directory_path === undefined ? "hidden" : "button"} onClick={this.loadNextImage}>
                        Show Next Image
                    </button>
                    <button className={this.directory_path === undefined ? "hidden" : "button"} onClick={this.dilateBinary}>
                        Dilate
                    </button>
                    <button className={this.directory_path === undefined ? "hidden" : "button"} onClick={this.erodeBinary}>
                        Erode
                    </button>
                    <button className={this.directory_path === undefined ? "hidden" : "button"} onClick={this.save}>
                        Save
                    </button>
                </header>
                <Binary
                    original_binary={this.src}
                />
            </div>
        )
    }
}


export default S3DirectoryBinaryEditor;