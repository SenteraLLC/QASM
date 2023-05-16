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
                }
                else if (this.state[class_type] === class_val) {
                    delete this.state[class_type]
                }
            }
        }

        this.setState(new_state);
    }

    render() {

        // Only show overlay if the active class has an overlay
        let show_overlay = false;

        return (
            <div
                className={"MultiClassGridImage " + this.state.class + show_overlay}
                id={this.image_name}
            >
                <div>
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
}

export default MultiClassGridImage;