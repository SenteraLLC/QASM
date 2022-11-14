import { Component } from 'react';
// import "../css/ImageLabeler.css";
// const { function_names } = require("../../public/electron_constants.js");

class ImageLabeler extends Component {

    constructor(props) {
        super(props);

        // Initialize props
        this.QASM      = props.QASM;
        this.image_dir = props.image_dir;
        this.anno_dir  = props.anno_dir;
        this.subtasks  = props.subtasks;
    }

    render() {
        return (
            <div>John Cena</div>
        )
    }
}

export default ImageLabeler;