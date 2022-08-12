import { Component } from 'react';
import folder_icon from "../../public/folder.png";
import "../css/S3Folder.css";

class S3Folder extends Component {
    constructor(props) {
        super(props);

        // Initialize props
        this.path = props.path

        // Get last folder in path
        this.display_path = this.path.split("/").slice(-2)
    }

    render() {
        return (
            <div className="S3Folder">
                <img 
                    src={folder_icon} 
                    id={this.path}
                    alt="folder_icon"/>
                <p>{this.display_path}</p>
            </div>
        )
    }
}

export default S3Folder;