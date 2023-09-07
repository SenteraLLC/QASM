import { Component } from "react";
import SingleBinaryEditor from "./SingleBinaryEditor";
import S3DirectoryBinaryEditor from "./S3DirectoryBinaryEditor";

/**
 * Returns diffrent Binary Editors based on the whichever mode is passed in.
 * SingleBinaryEditor is the default.
 */
class BinaryEditors extends Component {
    constructor(props) {
        super(props);
        // Expose component in window
        window.COMPONENT = this;
        
        this.props = props;
        this.mode = props.mode;
    }

    render() {
        switch (this.mode.toLowerCase()) {
            case "s3directory":
                return <S3DirectoryBinaryEditor {...this.props}/>
            // Single mode will be the default
            case "single":
            default:
                return <SingleBinaryEditor {...this.props}/>
        }
    }
}

export default BinaryEditors;