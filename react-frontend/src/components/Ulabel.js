import { Component } from 'react';
import { ULabel } from 'ulabel';
import "../css/Ulabel.css";
const { function_names } = require("../../public/electron_constants.js");

class Ulabel extends Component {
    constructor(props) {
        super(props);

        // Initialize props
        this.QASM    = props.QASM;
        this.image   = props.image || null;

        // Bind functions
        this.startULabel = this.startULabel.bind(this);
        this.onSubmit    = this.onSubmit.bind(this);

        // Start ulabel
        this.startULabel();
    }

    onSubmit(annotations) {
        console.log(annotations);
    }

    async startULabel() {
        if (this.image == null) {
            this.image = await this.QASM.call_backend(window, function_names.LOAD_IMAGE);
        }
        console.log(this.image);
        let subtasks = {
            row_classification: {
                display_name: "Row Classification",
                classes: [
                    {
                        name: "Male",
                        color: "blue",
                        id: 10,
                    },
                    {
                        name: "Female",
                        color: "white",
                        id: 11,
                    },
                ],
                allowed_modes: ["polyline"],
                resume_from: null,
                task_meta: null,
                annotation_meta: null,
            },
        };

        // Initial ULabel configuration
        let ulabel = new ULabel(
            "container",        // container_id
            this.image,         // image_data
            "QASM_User",        // username
            this.onSubmit,      // on_submit
            subtasks,           // subtasks
            // null,               // task_meta
            // null,               // annotation_meta
            // 1,                  // px_per_px, typescript refactor
            // null,               // initial_crop
            // 2,                  // Initial Line Size
            // null,               // instructions_url
            // null,               // config data, typescript refactor
        );
        this.ulabel = ulabel;

        // Wait for ULabel instance to finish initialization
        ulabel.init(function () {
            console.log("Finished initialization");
        });

    }

    render() {

        return (
            <div
                id="container" className="ulabel-container"
            ></div>
        )
    }
}

export default Ulabel;