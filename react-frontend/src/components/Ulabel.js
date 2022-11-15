import { Component } from 'react';
import { ULabel } from 'ulabel';
import "../css/Ulabel.css";
const { function_names } = require("../../public/electron_constants.js");

class Ulabel extends Component {
    ex_subtasks = {
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

    constructor(props) {
        super(props);

        // Initialize props
        this.QASM     = props.QASM;
        this.image    = props.image    || null;
        this.username = props.username || "QASM_User";
        this.onSubmit = props.onSubmit || this.defaultOnSubmit;
        this.subtasks = props.subtasks || this.ex_subtasks;

        // Bind functions
        this.startULabel        = this.startULabel.bind(this);
        this.defaultOnSubmit    = this.defaultOnSubmit.bind(this);

        // console.log("Starting:", this.image);

        // Start ulabel
        this.startULabel();
    }

    defaultOnSubmit(annotations) {
        alert("Annotations printed to console.")
        console.log(annotations);
    }

    async startULabel() {
        if (this.image == null) {
            this.image = await this.QASM.call_backend(window, function_names.LOAD_IMAGE);
            // alert("No image provided, canceling ulabel job...");
            // return;
        }

        console.log(this.image);

        // Initial ULabel configuration
        let ulabel = new ULabel(
            "container",        // container_id
            this.image,         // image_data
            this.username,      // username
            this.onSubmit,      // on_submit
            this.subtasks,      // subtasks
        );
        this.ulabel = ulabel;

        // Wait for ULabel instance to finish initialization
        ulabel.init(function () {
            console.log("Finished initialization");
        });

        console.log("round 2")
        ulabel.init();
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