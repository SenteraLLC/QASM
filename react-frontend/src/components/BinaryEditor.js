import { Component } from "react";
import Binary from "./Binary";
import "../css/BinaryEditor.css";

const { Image } = require("image-js");

class BinaryEditor extends Component {
    component_updater = 0;

    constructor(){
        super();
        this.updateOriginalBinary = this.updateOriginalBinary.bind(this);

        this.state = {
            original_binary_src: this.original_binary_src
        }
    }

    updateOriginalBinary(event) {
        console.log(event);

        let input = document.querySelector("#image_input");

        // Create a src for the image selected
        this.original_binary_src = URL.createObjectURL(input.files[0])

        this.setState({
            original_binary_src: this.original_binary_src
        });

        this.component_updater++;
    }

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

    async dilate() {
        let binary = await Image.load(document.querySelector("#output-binary").src);

        binary = binary.grey().mask();

        let new_binary = binary.dilate([[0,1,0],[1,1,1],[0,1,0]]);

        console.log(binary)

        document.querySelector("#output-binary").src = new_binary.toDataURL();
    }

    async erode() {
        let binary = await Image.load(document.querySelector("#output-binary").src);

        binary = binary.grey().mask();

        let new_binary = binary.erode([[0,1,0],[1,1,1],[0,1,0]]);

        console.log(binary)

        document.querySelector("#output-binary").src = new_binary.toDataURL();
    }

    render() {
        return (
            <div className="BinaryEditor" key={this.component_updater}>
                <button onClick={this.dilate}>
                    Dilate
                </button>
                <button onClick={this.erode}>
                    Erode
                </button>
                <input type="file" accept=".jpeg,.JPEG,.png,.PNG,.jpg,.JPG" id="image_input" onChange={this.updateOriginalBinary} />
                {/* <div>
                    <img id="original-binary" alt="Original Binary" />
                    <img id="output-binary" alt="Output"/>
                </div> */}
                <Binary original_binary={this.original_binary_src}/>
            </div>
        )
    }
}

export default BinaryEditor