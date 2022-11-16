import { Component } from 'react';
import Ulabel from './Ulabel.js';
// import "../css/ImageLabeler.css";
const { function_names } = require("../../public/electron_constants.js");

class ImageLabeler extends Component {
    component_updater = 0;
    image_dir = undefined;
    anno_dir = undefined;
    cur_image_name = null;
    cur_image_idx = 0;
    annotations = {};

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
            cur_image_name: this.cur_image_name,
        };

        // Bind functions
        this.loadImageDir    = this.loadImageDir.bind(this);
        this.selectImageDir  = this.selectImageDir.bind(this);
        this.selectAnnoDir   = this.selectAnnoDir.bind(this);
        this.loadAnnotations = this.loadAnnotations.bind(this);
        this.changeCurImage  = this.changeCurImage.bind(this);

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
            cur_image_name: this.cur_image_name,
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
            this.n_images = this.images_keys.length;

            // Load the first image
            this.cur_image_idx = 0;
            this.cur_image_name = this.images_keys[this.cur_image_idx];

            // Load annotations
            await this.loadAnnotations();

            this.updateState();
        }
    }

    async selectImageDir() {
        this.image_dir = await this.QASM.call_backend(window, function_names.OPEN_DIR); // prompt selection
        this.loadImageDir();
    }

    async selectAnnoDir() {
        this.anno_dir = await this.QASM.call_backend(window, function_names.OPEN_DIR); // prompt selection
        await this.loadAnnotations();
        this.updateState();
    }

    async loadAnnotations() {
        if (this.anno_dir !== undefined) {

            // anno filename should be image_name.json
            let filename = this.anno_dir + this.cur_image_name + ".json";
            try {
                this.annotations = await this.QASM.call_backend(window, function_names.LOAD_JSON, filename);
            } catch (e) {
                console.log(e);
                console.log("Failed to load annotation for " + this.cur_image_name);
                console.log("Anno name: " + filename);
            }
        }
    }

    async changeCurImage(idx_mod) {
        this.cur_image_idx += idx_mod;
        if (this.cur_image_idx < 0) { // Loop to end
            this.cur_image_idx = this.n_images - 1;
        } else if (this.cur_image_idx >= this.n_images) { // Loop back to start
            this.cur_image_idx = 0;
        }
        this.cur_image_name = this.images_keys[this.cur_image_idx];
        await this.loadAnnotations();
        this.updateState();
    }

    render() {
        return (
            <div className="S3DirectoryBinaryEditor" key={this.component_updater}>
                <h2 className={this.cur_image_name === null ? "hidden" : ""}>{this.cur_image_name}</h2>
                <header>
                    <button className="button" onClick={this.selectImageDir}>
                        Select Image Directory (Current: {this.image_dir === undefined ? "None" : this.image_dir})
                    </button>
                    <button className="button" onClick={this.selectAnnoDir}>
                        Select Annotation Directory (Current: {this.anno_dir === undefined ? "None" : this.anno_dir})
                    </button>
                    <br/>
                    <button className={this.cur_image_name === null ? "hidden" : "button"} onClick={() => this.changeCurImage(-1)}>
                        Back
                    </button>
                    <button className={this.cur_image_name === null ? "hidden" : "button"} onClick={() => this.changeCurImage(1)}>
                        Next
                    </button>
                </header>
                {this.cur_image_name !== null &&
                    <Ulabel
                        QASM = {this.QASM}
                        image = {this.images[this.cur_image_name]}
                        subtasks = {this.subtasks}
                        annotations = {this.annotations}
                    />
                }
            </div>
        )
    }
}

export default ImageLabeler;