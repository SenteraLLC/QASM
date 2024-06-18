import { Component } from 'react';
import { update_overlay_by_id } from '../QASM/utils.js';
import "../css/GridImage.css";
 
class GridImage extends Component {
    image = "";
    image_name = "";
    classes = []; // {class_name: string, svg_overlay: svg, opacity?: number}[]
    image_stack = [];

    constructor(props) {
        super(props);

        // Initialize props
        this.image                     = props.image;
        this.image_name                = props.image_name;
        this.classes                   = props.classes;
        this.image_stack               = props.image_stack;
        this.center_line_start_visible = props.center_line_start_visible;

        // Use state to store current class
        let default_class = props.default_class || this.classes[0].class_name // Default to first class
        this.state = {
            class: default_class
        };

        // Bind functions
        this.changeClass = this.changeClass.bind(this);
    }


    /**
     * Change class to the next class in this.classes
     */
    changeClass() {
        // Cycle through all classes
        let class_name;
        let idx = this.classes.findIndex(x => x.class_name === this.state.class);
        for (idx;  idx < this.classes.length; idx++) {
            class_name = this.classes[idx].class_name;
            if (class_name !== this.state.class) {
                this.setState({
                    class: class_name
                });
                break;
            } else if (idx+1 === this.classes.length) {
                idx = -1;
            }
        }
    }
    

    render() {

        // Only show overlay if the active class has an overlay
        let show_overlay;
        if (this.classes.find(x => x.class_name === this.state.class).svg_overlay !== null) {
            show_overlay = " show_overlay";
        }
        else {
            show_overlay = "";
        }

        return (
            <div 
                className={"GridImage " + this.state.class + show_overlay}
                onClick={this.changeClass}
                id={this.image_name}
            >
                <div className="image-and-overlay-container">
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
                    <img 
                        src={this.classes.find(x => x.class_name === this.state.class).svg_overlay} 
                        className="overlay hover-target" 
                        alt={this.image_name + " overlay"}
                        id={this.image_name + "-overlay"}>
                    </img>
                    {/* Vertical line, centered horizonally, that spans the entire height of the image */}
                    <div 
                        className={"center-line-overlay " + (this.center_line_start_visible ? "" : "hidden")} 
                        id={this.image_name + "-center-line-overlay"}>
                    </div>
                </div>
                <p className="image-name">{this.image_name}</p>
            </div>        
        )
    }

    componentDidUpdate() {
        // Update this particular overlay
        update_overlay_by_id(this.image_name + "-overlay");
    }
}

export default GridImage;