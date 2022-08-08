import { Component } from 'react';
import file_icon from "../../public/file.png";

class S3File extends Component {
    constructor(props) {
        super(props);

        // Initialize props
        this.path = props.path
    }

    render() {
        return (
            <div className="S3File">
                <img 
                    src={file_icon} 
                    id={this.path}
                    alt="file_icon"/>
                <p>{this.path.split('\\').pop().split('/').pop()}</p>
            </div>
        )
    }
}

export default S3File;