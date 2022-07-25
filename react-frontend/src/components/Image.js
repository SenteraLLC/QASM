import { Component } from 'react';
import "../css/Image.css";
 
class Image extends Component {
    image = "";
    image_name = "";
    classes = [];

    constructor(props) {
        super(props);

        // Initialize props
        this.image      = props.image;
        this.image_name = props.image_name;
        this.classes    = props.classes; 
    }

    changeClass() {
        console.log("click");
    }
    
    render() {
        return (
            <div className="Image" onClick={this.changeClass}>
                <img src={this.image} alt={this.image_name}></img>
                <p>{this.image_name}</p>
            </div>        
        )
    }
}

export default Image;