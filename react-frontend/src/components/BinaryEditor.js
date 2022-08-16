import { Component } from "react";
import "../css/BinaryEditor.css";

const { Image } = require("image-js");

class BinaryEditor extends Component {
    async updateCanvas() {
        // Grab the input element
        let input = document.querySelector("#image_input");

        // Create a src for the image selected
        let original_binary_src = URL.createObjectURL(input.files[0])

        // Update the original-binary img with the new src
        document.querySelector("#original-binary").src = original_binary_src;

        const image = await Image.load(original_binary_src);

        const binary = image.grey().mask();


        document.querySelector("#output-binary").src = binary.toDataURL();
    }

    async close() {
        let binary = await Image.load(document.querySelector("#output-binary").src);

        binary = binary.grey().mask();

        let new_binary = binary.close([[1,1,1],[1,1,1],[1,1,1]]);

        console.log(binary)

        document.querySelector("#output-binary").src = new_binary.toDataURL();
    }

    render() {
        return (
            <div className="BinaryEditor">
                <button onClick={this.close}>
                    Close
                </button>
                <input type="file" accept=".jpeg,.JPEG,.png,.PNG,.jpg,.JPG" id="image_input" onChange={this.updateCanvas} />
                <div>
                    <img id="original-binary" alt="Original Binary" />
                    <img id="output-binary" alt="Output"/>
                </div>
            </div>
        )
    }
}

export default BinaryEditor