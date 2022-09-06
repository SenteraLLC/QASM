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
        this.props = props;
        this.mode = props.mode;
    }

    render() {
        switch (this.mode) {
            case "s3directory":
                return <S3DirectoryBinaryEditor {...this.props}/>
            case "single":
            default:
                return <SingleBinaryEditor {...this.props}/>
        }
    }
}

export default BinaryEditors;