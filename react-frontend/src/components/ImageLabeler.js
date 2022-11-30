import { Component } from 'react';
import Ulabel from './Ulabel.js';
import "../css/ImageLabeler.css";
const { function_names } = require("../../public/electron_constants.js");

class ImageLabeler extends Component {
    component_updater = 0;
    cur_image_name = null;
    cur_image_idx = 0;
    annotations = {};
    anno_filename = null;

    constructor(props) {
        super(props);

        // Initialize props
        this.QASM      = props.QASM;
        this.image_dir = props.image_dir || null
        this.anno_dir  = props.anno_dir  || null
        this.subtasks  = props.subtasks  || null

        // Init state
        this.state = {
            image_dir: this.image_dir,
            cur_image_name: this.cur_image_name,
            image: null,
            subtasks: this.subtasks,
            annotations: this.annotations,
        };

        // Bind functions
        this.loadImageDir     = this.loadImageDir.bind(this);
        this.selectImageDir   = this.selectImageDir.bind(this);
        this.selectAnnoDir    = this.selectAnnoDir.bind(this);
        this.loadAnnotations  = this.loadAnnotations.bind(this);
        this.changeCurImage   = this.changeCurImage.bind(this);
        this.on_submit        = this.on_submit.bind(this);

        // TODO: on-submit logic (save annos, nav to next? mark qa?)
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
            image: this.images[this.cur_image_name],
            subtasks: this.subtasks,
            annotations: this.annotations,
        });
        this.component_updater = 1; // only updates the first time the page renders
    }

    async loadImageDir() {
        if (this.image_dir !== null) {

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
        let res = await this.QASM.call_backend(window, function_names.OPEN_DIR, this.image_dir); // prompt selection
        if (res !== null) {
            this.image_dir = res;
            this.loadImageDir();
        }
    }

    async selectAnnoDir() {
        let res = await this.QASM.call_backend(window, function_names.OPEN_DIR, this.anno_dir); // prompt selection
        if (res !== null) {
            this.anno_dir = res;
            await this.loadAnnotations();
            this.updateState();
        }
    }

    async loadAnnotations() {
        if (this.anno_dir !== null) {

            // anno filename should be image_name.json
            this.anno_filename = this.anno_dir + this.cur_image_name + ".json";
            try {
                this.annotations = await this.QASM.call_backend(window, function_names.LOAD_JSON, this.anno_filename);
            } catch (e) {
                console.log(e);
                console.log("Failed to load annotation for " + this.cur_image_name);
                console.log("Anno name: " + this.anno_filename);
                this.annotations = {};
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

    // Save annotations in the same way we loaded them
    async on_submit(annotations) {
        if (this.anno_filename !== null) {
            let params = {
                labels: {},
                path: this.anno_filename,
            }
            console.log(annotations);
            for (let task in this.subtasks) {
                if (this.subtasks[task]["resume_from"] !== null) {
                    let resume_from_key = this.subtasks[task]["resume_from"]; // User defined key
                    params.labels[resume_from_key] = annotations["annotations"][task];
                }
            }           

            try {
                await this.QASM.call_backend(window, function_names.SAVE_JSON_TO_PATH, params);
                console.log("Annotations saved."); 
            } catch(e) {
                console.log(e);
                console.log("Failed to save annotations for " + this.cur_image_name);
            }
            this.changeCurImage(1); // Go to next image
        }
    }

    render() {
        return (
            <div className="ImageLabeler" key={this.component_updater}>
                <h2 className={this.cur_image_name === null ? "hidden" : ""}>{this.cur_image_name} ({this.cur_image_idx+1} of {this.n_images})</h2>
                <header>
                    <button className="button" onClick={this.selectImageDir}>
                        Select Image Directory (Current: {this.image_dir === null ? "None" : this.image_dir})
                    </button>
                    <button className="button" onClick={this.selectAnnoDir}>
                        Select Annotation Directory (Current: {this.anno_dir === null ? "None" : this.anno_dir})
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
                        image = {this.state.image} // Use state so changes trigger child "componentDidUpdate" hook
                        subtasks = {this.state.subtasks}
                        annotations = {this.state.annotations}
                        on_submit = {this.on_submit}
                    />
                }
            </div>
        )
    }
}

export default ImageLabeler;