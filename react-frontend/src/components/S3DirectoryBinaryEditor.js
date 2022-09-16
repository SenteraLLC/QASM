import { Component } from "react";
import Binary from "./Binary";
import { function_names } from "../../public/electron_constants";

/**
 * Creates a component for editing all binaries in an s3 folder.
 */
class S3DirectoryBinaryEditor extends Component {
    component_updater = 0;

    constructor(props) {
        super()
        console.log("s3BinaryEditor", props)
        this.QASM = props.QASM;

        // Bind functions
        this.loadDirectory  = this.loadDirectory.bind(this);
        this.loadFirstImage = this.loadFirstImage.bind(this);
        this.loadNextImage  = this.loadNextImage.bind(this);
        this.save           = this.save.bind(this);
    }


    async loadDirectory() {
        this.directory_path = await this.QASM.call_backend(window, function_names.OPEN_DIR);

        // console.log(directory_path, "directory path")

        if (this.directory_path !== undefined) {

            // Create a dictionary for every image in the directory where the image name is
            // the key and the path is the value
            this.images = await this.QASM.call_backend(window, function_names.LOAD_IMAGES, this.directory_path);
            console.log(this.images)
            // Create a list of keys
            this.images_keys = Object.keys(this.images).sort();

            // Load the first image
            this.loadFirstImage();
        }
    }


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


    loadNextImage() {
        // Increment the current image
        this.current_image++;

        // Check if the current image is outside the list of images
        if (this.images.length >= this.current_image) {
            // If the current image is outside the list of images, then reset it back to 0
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


    async save() {
        // Grab the binary operations to perform
        const operations = document.querySelector(".operations-hidden").innerHTML;

        const data = {
            operations: operations,
            directory_path: this.directory_path,
        }

        // Have the backend apply the binary operations to every image in the directory, and
        // save it in a new folder
        await this.QASM.call_backend(window, function_names.SAVE_BINARY_DIRECTORY, data)
    }


    render() {
        return (
            <div className="s3DirectoryBinaryEditor" key={this.component_updater}>
                <button className="button" onClick={this.loadDirectory}>
                    Select Directory
                </button>
                <button className="button" onClick={this.loadNextImage}>
                    Show Next Image
                </button>
                <button className="button" onClick={this.save}>
                    Save
                </button>
                <Binary
                    original_binary={this.src}
                />
            </div>
        )
    }
}


export default S3DirectoryBinaryEditor;