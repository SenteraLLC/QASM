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
        this.image        = props.image;
        this.image_name   = props.image_name;
        this.classes      = props.classes;
        this.image_stack  = props.image_stack;

        // Use state to store current class
        let default_class = props.default_class.class_name || this.classes[0].class_name // Default to first class
        this.state = {
            class: default_class
        };

        // Bind functions
        this.changeClass = this.changeClass.bind(this);

        // Grab the document's head tag and create a style tag
        let document_head = document.getElementsByTagName('head')[0]
        let style = document.createElement('style');

        // Loop through all classes and append each classes' overlay opacity to it
        for (let each_class of this.classes) {
            if (each_class.opacity !== undefined) {

                // Update the style tag
                style.textContent += `div.${each_class.class_name} > * > img.overlay {
                    filter: opacity(${each_class.opacity})
                }
                `
            }
            else {
                // Update the style tag
                style.textContent += `div.${each_class.class_name} > * > img.overlay {
                    filter: opacity(1)
                }
                `
            }
        }

        document_head.appendChild(style);
    }

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
                
                // console.log("Changed " + this.image_name + " to " + this.state.class);
                break;
            } else if (idx+1 === this.classes.length) {
                idx = -1;
            }
        }

        let current_class_object = this.classes.find(x => x.class_name === class_name)
    }
    
    render() {

        let show_overlay
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
                // style={}
                id={this.image_name}
            >
                <div>
                    <img 
                        src={this.classes.find(x => x.class_name === this.state.class).svg_overlay} 
                        className="overlay hover-target" 
                        alt={this.image_name + " overlay"}
                        id={this.image_name + "-overlay"}>
                    </img>
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
            </div>        
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Update this particular overlay
        update_overlay_by_id(this.image_name + "-overlay");
    }
}

export default GridImage;