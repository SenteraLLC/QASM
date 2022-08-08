import { Component } from 'react';
import S3Folder from "./S3Folder.js";
import S3File from "./S3File.js";
const { image_types } = require("../../public/electron_constants.js");

class S3Browser extends Component {

    constructor(props) {
        super(props);
        
        this.QASM    = props.QASM
        this.parents = props.parents || [] // Stack of parent folders
        this.path    = props.path    || ""
        this.folders = props.folders || this.QASM.folders
        this.files   = props.files   || this.QASM.files

        this.state = {
            path: this.path
        };

        // Bind functions
        this.selectFolder = this.selectFolder.bind(this);
        this.changePath   = this.changePath.bind(this);
        this.goBack       = this.goBack.bind(this);
    }

    selectFolder() {
        // TODO: Check if folder contains images and warn user if it dont
        
        let images_present = false;
        for (let file of this.files) {
            let ext = file.split('\\').pop().split('/').pop().split('.').pop()
            console.log(ext);
            if (ext in image_types) {
                images_present = true;
                break;
            }
        }
        
        if (images_present) {
            let data = {
                success: true,
                path: this.path,
            }
            // Send data back to parent window
            window.opener.postMessage(data, '*');
            window.close();
        } else {
            alert("No images found in folder " + this.path);
        }

        
    }

    async changePath(folder) {
        try {
            let response = await this.QASM.call_backend(window, "openS3Folder", folder);
            this.folders = response.folders;
            this.files = response.files;
            this.parents.push(this.path);
            this.path = folder;

            this.setState({
                path: this.path
            });
        } catch {
            console.log("Failed to load " + folder);
        }
    }

    async goBack() {
        // TODO: Back icon? keep at top of list
        let folder = this.parents.pop();
        try {
            let response = await this.QASM.call_backend(window, "openS3Folder", folder);
            this.folders = response.folders;
            this.files = response.files;
            this.path = folder;

            this.setState({
                path: this.path
            });
        } catch {
            console.log("Failed to go back to " + folder);
            this.parents.push(folder);
        }
    }

    render() {
        return (
            <div>
                <h2>S3 Browser: {this.QASM.s3_bucket}</h2>
                <button 
                    onClick={this.selectFolder}>
                    Select Directory: {this.path}
                </button><br/>
                { this.parents.length !== 0 &&
                    <button 
                        onClick={this.goBack}>
                        Back
                    </button>
                }
                {this.folders.map(folder_name => (
                    <div onClick={e => this.changePath(e.target.id)} key={folder_name}>
                        <S3Folder
                            path={folder_name}/>  
                    </div>
                ))}
                {this.files.map(file_name => (
                    <S3File
                        key={file_name}
                        path={file_name}/>  
                ))}
            </div>
        )
    }
}

export default S3Browser;