// Description: This component is used to display an image with multiple classes, to be labeled via checkboxes.
import { Component } from 'react';
import "../css/GridImage.css";

class MultiClassGridImage extends Component {
    image = "";
    image_name = "";
    /**
     * Key: class_type
     * Value: [{class_value: string}]
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
                className={"GridImage " + this.state.class + show_overlay}
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
                {Object.keys(this.classes).map(class_type => {
                    if (this.classes[class_type].selector_type === "radio") {
                        return (
                            <div style={{ "float": "left" }} key={class_type}>
                                <p>{class_type}</p>
                                {this.classes[class_type].class_values.map(class_val => (
                                    <div>
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
                            <div style={{ "float": "left" }} key={class_type}>
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
        )
    }
}

export default MultiClassGridImage;