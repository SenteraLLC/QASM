import { Component } from "react";
import "../css/BinaryEditor.css";

const { Image } = require("image-js");

class BinaryEditor extends Component {
    updateCanvas() {
        // Grab the input element
        let input = document.querySelector("#image_input");

        // Create a src for the image selected
        let original_binary_src = URL.createObjectURL(input.files[0])

        // Update the original-binary img with the new src
        document.querySelector("#original-binary").src = original_binary_src;
        
    }

    render() {
        return (
            <div className="BinaryEditor">
                <input type="file" accept=".jpeg,.JPEG,.png,.PNG" id="image_input" onChange={this.updateCanvas} />
                <img id="original-binary" alt="Original Binary"></img>
            </div>
        )
    }
}

export default BinaryEditor