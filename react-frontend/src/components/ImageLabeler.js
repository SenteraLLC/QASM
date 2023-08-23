import { Component } from 'react';
import Ulabel from './Ulabel.js';
import "../css/ImageLabeler.css";
const { getChildPath } = require("../QASM/utils.js");
const { function_names } = require("../../public/electron_constants.js");

// https://github.com/SenteraLLC/ulabel/blob/main/api_spec.md
const ULABEL_PROPS = ["container_id", "image_data", "username", "submit_button", "subtasks", "task_meta", "annotation_meta", "px_per_px", "init_crop", "initial_line_size", "instructions_url", "config_data", "toolbox_order"]
// Reserved props are props that are used by this component, so the user should not use them
const RESERVED_PROPS = ["container_id", "image_data", "submit_buttons"];
const SHADOWED_PROPS = ["subtasks"]; // These props are shadowed by this component, so the user will use them but we won't pass them as-is to ulabel

class ImageLabeler extends Component {
    component_updater = 0;
    cur_image_name = null;
    cur_image_idx = 0;
    annotations = {};
    anno_filename = null;

    constructor(props) {
        super(props);
        // Expose component in window
        window.COMPONENT = this;

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

        // store the rest of the props as long as they are valid ulabel props
        // and are also not reserved props
        this.other_ulabel_props = {};
        for (let prop in props) {
            if (ULABEL_PROPS.includes(prop)) {
                if (RESERVED_PROPS.includes(prop)) {
                    // Warn the user that the prop will be overwritten
                    console.log("Warning: " + prop + " is ULabel prop reserved by this component and will be overwritten.");
                } else if (SHADOWED_PROPS.includes(prop)) {
                    continue; // Don't add to other_ulabel_props
                } else {
                    // Use the prop
                    this.other_ulabel_props[prop] = props[prop];
                }
            } 
        }
        console.log("props:", props);
        console.log("other props:", this.other_ulabel_props);

        // Bind functions
        this.loadImageDir     = this.loadImageDir.bind(this);
        this.selectImageDir   = this.selectImageDir.bind(this);
        this.selectAnnoDir    = this.selectAnnoDir.bind(this);
        this.selectDirType    = this.selectDirType.bind(this);
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

    async loadImageDir(start_image_name = undefined) {
        if (this.image_dir !== null) {
            // Create a dictionary for every image in the directory where the image name is
            // the key and the path is the value
            this.images = await this.QASM.call_backend(window, function_names.LOAD_IMAGES, {"start_folder": this.image_dir});

            // Create a list of keys
            this.images_keys = Object.keys(this.images).sort();
            this.n_images = this.images_keys.length;

            // Load the start_image if specified, else start at the first image
            if (start_image_name !== undefined && this.images_keys.includes(start_image_name)) {
                this.cur_image_idx = this.images_keys.indexOf(start_image_name);
                this.cur_image_name = start_image_name;
            } else {
                this.cur_image_idx = 0;
                this.cur_image_name = this.images_keys[this.cur_image_idx];
            }

            // Load annotations
            await this.loadAnnotations();


        }
    }

    async selectImageDir() {
        let res = await this.QASM.call_backend(window, function_names.OPEN_DIR_DIALOG, {"start_folder": this.image_dir}); // prompt selection
        if (res !== null) {
            this.image_dir = res;
            this.loadImageDir();
        }
    }

    async selectAnnoDir() {
        let res = await this.QASM.call_backend(window, function_names.OPEN_DIR_DIALOG, {"start_folder": this.anno_dir}); // prompt selection
        if (res !== null) {
            this.anno_dir = res;
            await this.loadAnnotations();
        }
    }

    /**
     * Handler for when the user opens a deep link
     * to a directory. The user will be prompted to
     * select whether the directory contains images
     * or annotations.
     * 
     * @param {string} start_folder folder to start in
     * @param {string} bucket_name name of s3 bucket
     */
    selectDirType(start_folder, bucket_name) {
        /* eslint-disable */
        // Prompt user to select image or annotation directory
        let load_image_dir = confirm("Load " + bucket_name + "/" + start_folder + " as image directory?");
        let load_anno_dir = false;
        if (!load_image_dir) {
            load_anno_dir = confirm("Load " + bucket_name + "/" + start_folder + " as annotation directory?");
        }

        // If either is true, then load the directory
        if (load_image_dir || load_anno_dir) {
            // Confirm switching buckets if necessary
            if (bucket_name !== undefined && bucket_name !== this.QASM.s3_bucket) {
                if (confirm("Proceed and switch from bucket " + this.QASM.s3_bucket + " to bucket: " + bucket_name + "?")) {
                    this.QASM.s3_bucket = bucket_name;
                } else {
                    console.log("Canceled directory selection.");
                    return;
                }
            }

            // Load the directory
            if (load_image_dir) {
                this.image_dir = start_folder;
                this.loadImageDir();
            } else {
                this.anno_dir = start_folder;
                this.loadAnnotations();
            }
        }
    }

    async loadAnnotations(anno_filename = undefined) {
        if (this.anno_dir !== null) {

            this.anno_filename = getChildPath(
                this.anno_dir, 
                anno_filename !== undefined ? anno_filename : this.cur_image_name + ".json"
            );
            try {
                this.annotations = await this.QASM.call_backend(window, function_names.LOAD_JSON, this.anno_filename);
            } catch (e) {
                console.log(e);
                console.log("Failed to load annotation for " + this.cur_image_name);
                console.log("Anno name: " + this.anno_filename);
                this.annotations = {};
            }
        }
        this.updateState();
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
    }

    // Save annotations in the same way we loaded them
    async on_submit(annotations) {
        if (this.anno_filename !== null) {
            let params = {
                labels: {},
                start_folder: this.anno_filename,
            }
            console.log(annotations);
            let resume_from_key
            for (let task in this.subtasks) {
                if (this.subtasks[task]["resume_from"] !== null) {
                    resume_from_key = this.subtasks[task]["resume_from"]; // User defined key
                } else {
                    resume_from_key = task
                }
                params.labels[resume_from_key] = annotations["annotations"][task];
            }           

            try {
                await this.QASM.call_backend(window, function_names.SAVE_JSON, params);
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
                    // Any custom props we define here should be added to RESERVED_PROPS, else
                    // if the user passes in a valid ulabel prop with the same name, it will collide
                    <Ulabel
                        QASM = {this.QASM}
                        image = {this.state.image} // Use state so changes trigger child "componentDidUpdate" hook
                        subtasks = {this.state.subtasks}
                        annotations = {this.state.annotations}
                        on_submit = {this.on_submit}
                        other_ulabel_props = {this.other_ulabel_props}
                    />
                }
            </div>
        )
    }
}

export default ImageLabeler;