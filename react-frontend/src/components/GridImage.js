import { Component } from 'react';
import "../css/GridImage.css";
 
class GridImage extends Component {
    image = "";
    image_name = "";
    classes = [];

    constructor(props) {
        super(props);

        // Initialize props
        this.image        = props.image;
        this.image_name   = props.image_name;
        this.classes      = props.classes;
        this.css_by_class = props.css_by_class;

        // Use state to store current class
        let default_class = props.default_class || this.classes[0] // Default to first class
        this.state = {
            class: default_class
        };

        // Bind functions
        this.changeClass = this.changeClass.bind(this);
    }

    changeClass() {
        // Cycle through all classes
        let class_name;
        let idx = this.classes.indexOf(this.state.class);
        for (idx;  idx < this.classes.length; idx++) {
            class_name = this.classes[idx];
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

        
    }
    
    render() {
        return (
            <div 
                className="GridImage" 
                onClick={this.changeClass}
                style={this.css_by_class[this.state.class]}
            >
                <img src={this.image} alt={this.image_name}></img>
                {/* <div style={this.css_by_class[this.state.class]}></div> */}
                <p>{this.image_name}</p>
            </div>        
        )
    }
}

export default GridImage;