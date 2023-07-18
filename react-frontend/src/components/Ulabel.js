import { Component } from 'react';
import { ULabel } from 'ulabel';
import "../css/Ulabel.css";

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

        this.initProps(props);
     
        // Bind functions
        this.initProps            = this.initProps.bind(this);
        this.startULabel          = this.startULabel.bind(this);
        this.defaultOnSubmit      = this.defaultOnSubmit.bind(this);
        this.attachAnnosToSubtask = this.attachAnnosToSubtask.bind(this);
        this.reload               = this.reload.bind(this);
        this.clearAllAnnotations  = this.clearAllAnnotations.bind(this);

        // Start ulabel
        this.startULabel();
    }

    initProps(props) {
        // Initialize props
        this.QASM        = props.QASM;
        this.image       = props.image       || null;
        this.username    = props.username    || "QASM_User";
        this.on_submit   = props.on_submit   || this.defaultOnSubmit;
        this.annotations = props.annotations || null;
        
        // Deep copy 
        this.subtasks    = JSON.parse(JSON.stringify(props.subtasks)) || this.ex_subtasks;
    }

    defaultOnSubmit(annotations) {
        alert("Annotations printed to console.")
        console.log(annotations);
    }

    async startULabel() {
        if (this.image == null) {
            alert("No image provided, canceling ulabel job...");
            return;
        }

        await this.attachAnnosToSubtask();

        console.log(this.subtasks);

        await setTimeout(() => {}, 1); // idk why but unless we wait ulabel can't load the image

        // Initial ULabel configuration
        this.ulabel = new ULabel(
            "container",        // container_id
            this.image,         // image_data
            this.username,      // username
            this.on_submit,     // on_submit
            this.subtasks,      // subtasks
        );

        // Wait for ULabel instance to finish initialization
        this.ulabel.init(function () {
            console.log("Finished initialization");
        });
    }

    async attachAnnosToSubtask(reload=false) {
        // In config.json "subtasks" field, the user should specify the
        // key used to store the annotations in their json as the "resume_from" field. 
        // Here we use that key to put the actual annotations in the resume_from of
        // the subtask.
        let resume_from_key;
        if (this.annotations != null) {
            for (let task in this.subtasks) {
                if (this.subtasks[task]["resume_from"] !== null) {
                    resume_from_key = this.subtasks[task]["resume_from"]; // User defined key
                } else {
                    resume_from_key = task; // Default to task key
                }

                if (resume_from_key in this.annotations) {
                    this.subtasks[task]["resume_from"] = this.annotations[resume_from_key];

                    if (reload) { // On reload, ulabel is already running so we update in place
                        this.ulabel.set_annotations(this.annotations[resume_from_key], task);
                    }
                }
            }
        }
    }

    clearAllAnnotations(subtasks) {
        for (let task in subtasks) {
            this.ulabel.set_annotations({}, task);
        }
    }

    reload(props, oldSubtasks) {
        this.initProps(props);
        this.ulabel.swap_frame_image(this.image);
        this.clearAllAnnotations(oldSubtasks);
        this.attachAnnosToSubtask(true);
    }

    render() {
        return (
            <div
                id="container" 
                className="ulabel-container"
            ></div>
        )
    }

    componentDidUpdate(prevProps) { // Triggers when props change
        this.reload(this.props, prevProps.subtasks);
    }

    componentWillUnmount() {
        // This is a hack to force the page to reload
        // when ulabel needs to be destroyed, such as 
        // when navigating to a new page. Otherwise, 
        // multiple layers of ulabel hooks build up in 
        // the app which causes some wacky stuff to happen.

        // TODO: With MemoryRouter this will always go back to homepage,
        // when it should ideally reload the target component
        window.location.reload(); 
    }
}

export default Ulabel;