import { Component } from 'react';
// import "../css/ImageLabeler.css";
const { function_names } = require("../../public/electron_constants.js");

class ImageLabeler extends Component {
    component_updater = 0;
    image_dir = undefined;
    anno_dir = undefined;

    constructor(props) {
        super(props);

        // Initialize props
        this.QASM      = props.QASM;
        this.image_dir = props.image_dir;
        this.anno_dir  = props.anno_dir;
        this.subtasks  = props.subtasks;

        // Init state
        this.state = {
            image_dir: this.image_dir,
        };

        // Bind functions
        this.loadImageDir   = this.loadImageDir.bind(this);
        this.selectImageDir = this.selectImageDir.bind(this);

        // TODO: prompt anno dir selection if not provided
        // TODO: image selection logic (drop down? progress screen? in order?)
        // TODO: on-submit logic (save annos, nav to next?)
        this.loadImageDir();
    }

    /**
     * Update the state variables and force
     * the page to update.
     */
     updateState() {
        this.setState({
            image_dir: this.image_dir,
        });
        this.component_updater++;
    }

     async loadImageDir() {
        if (this.image_dir !== undefined) {

            // Create a dictionary for every image in the directory where the image name is
            // the key and the path is the value
            this.images = await this.QASM.call_backend(window, function_names.LOAD_IMAGES, this.image_dir);

            // Create a list of keys
            this.images_keys = Object.keys(this.images).sort();

            // Load the first image
            // console.log(this.images_keys, this.images);
        }
    }

    async selectImageDir() {
        this.image_dir = await this.QASM.call_backend(window, function_names.OPEN_DIR); // prompt selection
        this.loadImageDir();
        this.updateState();
    }

    render() {
        return (
            <div className="S3DirectoryBinaryEditor" key={this.component_updater}>
                <header>
                    <button className="button" onClick={this.selectImageDir}>
                        Select Image Directory (Current: {this.image_dir === undefined ? "None" : this.image_dir})
                    </button>
                    {/* <button className={this.directory_path === undefined ? "hidden" : "button"} onClick={this.loadNextImage}>
                        Show Next Image
                    </button> */}
                </header>
            </div>
        )
    }
}

export default ImageLabeler;