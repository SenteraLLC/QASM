// Description: This component is used to display an image with multiple classes, to be labeled via checkboxes.
import { Component } from 'react';
import "../css/MultiClassGridImage.css";

class MultiClassGridImage extends Component {
    image = "";
    image_name = "";
    /**
     * Key: class_type
     * Value: {
     *      "selector_type": string, "radio" or "checkbox"
            "class_values": [string],
            "default": string,
            "class_colors": {
                class_value: string, a color
            }
            "class_overlays": boolean
        }
     */
    classes = {};
    image_stack = [];

    constructor(props) {
        super(props);

        // Initialize props
        this.image = props.image;
        this.image_name = props.image_name;
        this.classes = props.classes;
        this.image_stack = props.image_stack;
        this.default_classes = props.default_classes;

        // Use state to store current class
        // First class_value in each class_type
        this.state = {};
        for (let class_type in this.classes) {
            if (this.default_classes !== null && class_type in this.default_classes) {
                this.state[class_type] = this.default_classes[class_type];
            } else if ("default" in this.classes[class_type]) {
                this.state[class_type] = this.classes[class_type]["default"];
            }
        }



        // Bind functions
        this.changeClass = this.changeClass.bind(this);
        this.setOverlayColor = this.setOverlayColor.bind(this);
        this.useClassOverlays = this.useClassOverlays.bind(this);
    }

    /**
     * Update state based on user inputs
     */
    changeClass() {
        let new_state = {};
        for (let class_type in this.classes) {
            for (let class_val of this.classes[class_type].class_values) {
                if (document.getElementById(this.image_name + "_" + class_val).checked) {
                    new_state[class_type] = class_val;

                    if (this.useClassOverlays(class_type, class_val)) {
                        // Set overlay color if class_colors is defined for this class_type and class_val
                        this.setOverlayColor(this.classes[class_type]["class_colors"][class_val]);
                    } else {
                        // Turn off the overlay
                        this.setOverlayColor("transparent");
                    }
                }
                else if (this.state[class_type] === class_val) {
                    delete this.state[class_type]
                }
            }
        }

        this.setState(new_state);
    }


    /**
     * Loop through all classes and update the overlay color if needed
     */
    refreshAllOverlays() {
        for (let class_type in this.classes) {
            let class_val = this.state[class_type];
            
            // Set overlay color if needed
            if (this.useClassOverlays(class_type, class_val)) {
                this.setOverlayColor(this.classes[class_type]["class_colors"][class_val]);
            }
        }
    }


    /**
     * Check if a class_type and class_val should have an overlay
     * 
     * @param {string} class_type class type
     * @param {string} class_val class value
     * @returns boolean, true if the class_type should have an overlay
     */
    useClassOverlays(class_type, class_val) {
        if (
            "class_overlays" in this.classes[class_type] && 
            "class_colors" in this.classes[class_type] &&
            class_val in this.classes[class_type]["class_colors"]
        ) {
            return this.classes[class_type]["class_overlays"]
        }
        return false;
    }


    /**
     * Change the overlay color
     * 
     * @param {string} color valid css color
     */
    setOverlayColor(color) {
        let class_overlay = document.getElementById(this.image_name + "-class-overlay")
        class_overlay.style.setProperty("--background", color);
    }


    render() {

        // Only show overlay if the active class has an overlay
        let show_overlay = false;

        return (
            <div
                className={"MultiClassGridImage " + this.state.class + show_overlay}
                id={this.image_name}
            >
                <div className="image-holder">
                    <img
                        src={this.image}
                        alt={this.image_name}
                        id={this.image_name + "-image"}
                        className={"hover-target"}>
                    </img>
                    {this.image_stack.map(image => (
                        <img
                            src={image}
                            alt={this.image_name + "_layer" + this.image_stack.indexOf(image)}
                            id={this.image_name + "_layer" + this.image_stack.indexOf(image)}
                            key={this.image_name + "_layer" + this.image_stack.indexOf(image)}
                            className="hidden hover-target">
                        </img>
                    ))}
                    {/* TODO: support more than one class overlay at once */}
                    <div className="class-overlay" id={this.image_name + "-class-overlay"}></div>
                </div>
                <p className="image-name">{this.image_name}</p>
                <div className="class-selector-holder">
                    {Object.keys(this.classes).map(class_type => {
                        if (this.classes[class_type].selector_type === "radio") {
                            return (
                                <div className="class-selector" key={class_type}>
                                    <p className="class-type">{class_type}</p>
                                    {this.classes[class_type].class_values.map(class_val => (
                                        <div style={{
                                            color: // If class_colors is defined for this class_type and class_val, use that color
                                                "class_colors" in this.classes[class_type] && class_val in this.classes[class_type]["class_colors"]
                                                    ? this.classes[class_type]["class_colors"][class_val]
                                                    : "black",
                                            display: "inline-block",
                                            padding: "0px 5px",
                                        }}>
                                            <input
                                                type="radio"
                                                name={this.image_name + "_" + class_type}
                                                id={this.image_name + "_" + class_val}
                                                onChange={this.changeClass}
                                                checked={this.state[class_type] === class_val}
                                            ></input>
                                            <label htmlFor={this.image_name + "_" + class_val}>{class_val}</label>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                        else if (this.classes[class_type].selector_type === "checkbox") {
                            return (
                                <div className="class-selector" key={class_type}>
                                    <p>{class_type}</p>
                                    {this.classes[class_type].class_values.map(class_val => (
                                        <div>
                                            <input
                                                type="checkbox"
                                                name={this.image_name + "_" + class_type}
                                                id={this.image_name + "_" + class_val}
                                                onChange={this.changeClass}
                                                checked={this.state[class_type] === class_val}
                                            ></input>
                                            <label htmlFor={this.image_name + "_" + class_val}>{class_val}</label>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                        return ( 
                            <p>pp</p>
                        )
                    })}
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.refreshAllOverlays();
    }
}

export default MultiClassGridImage;