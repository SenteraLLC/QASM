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

        // Use state to store current class
        this.state = {
        };

        // Bind functions
        this.changeClass = this.changeClass.bind(this);
    }

    /**
     * Update state based on user inputs
     */
    changeClass() {
        let new_state = {};
        Object.keys(this.classes).map(class_type => (
            this.classes[class_type].map(class_data => {
                if (document.getElementById(this.image_name + "_" + class_data.class_value).checked) 
                { 
                    new_state[class_type] = class_data.class_value;
                }
                return null;
            }
            )
        ))

        this.setState(new_state);
        console.log(new_state);
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
                <div>
                    {Object.keys(this.classes).map(class_type => (
                        <table>
                            {this.classes[class_type].map(class_data => (
                                <tr>
                                    <input 
                                        type="checkbox" 
                                        id={this.image_name + "_" + class_data.class_value}
                                        onChange={this.changeClass}
                                    ></input>
                                    <label for={this.image_name + "_" + class_data.class_value}>{class_data.class_value}</label>
                                </tr>
                            ))}
                        </table>
                    ))}
                </div>
            </div>
        )
    }

    componentDidUpdate() {
    }
}

export default MultiClassGridImage;