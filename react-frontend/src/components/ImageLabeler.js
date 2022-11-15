import { Component } from 'react';
import Ulabel from './Ulabel.js';
// import "../css/ImageLabeler.css";
const { function_names } = require("../../public/electron_constants.js");

class ImageLabeler extends Component {
    component_updater = 0;
    image_dir = undefined;
    anno_dir = undefined;
    cur_image_name = null;

    constructor(props) {
        super(props);

        // Initialize props
        this.QASM      = props.QASM;
        this.image_dir = props.image_dir;
        this.anno_dir  = props.anno_dir;
        this.subtasks  = props.subtasks;

        // Init state
        this.state = {
            image_dir: this.image_dir,
            cur_image_name: this.cur_image_name,
        };

        // Bind functions
        this.loadImageDir   = this.loadImageDir.bind(this);
        this.selectImageDir = this.selectImageDir.bind(this);

        // TODO: prompt anno dir selection if not provided
        // TODO: image selection logic (drop down? progress screen? in order?)
        // TODO: on-submit logic (save annos, nav to next?)
        this.loadImageDir();
    }

    /**
     * Update the state variables and force
     * the page to update.
     */
     updateState() {
        this.setState({
            image_dir: this.image_dir,
            cur_image_name: this.cur_image_name,
        });
        this.component_updater++;
    }

     async loadImageDir() {
        if (this.image_dir !== undefined) {

            // Create a dictionary for every image in the directory where the image name is
            // the key and the path is the value
            this.images = await this.QASM.call_backend(window, function_names.LOAD_IMAGES, this.image_dir);

            // Create a list of keys
            this.images_keys = Object.keys(this.images).sort();

            // Load the first image
            this.cur_image_name = this.images_keys[0];
            console.log(this.cur_image_name);
            this.updateState();
        }
    }

    async selectImageDir() {
        this.image_dir = await this.QASM.call_backend(window, function_names.OPEN_DIR); // prompt selection
        this.loadImageDir();
        this.updateState();
    }

    render() {
        return (
            <div className="S3DirectoryBinaryEditor" key={this.component_updater}>
                <header>
                    <button className="button" onClick={this.selectImageDir}>
                        Select Image Directory (Current: {this.image_dir === undefined ? "None" : this.image_dir})
                    </button>
                    {/* <button className={this.directory_path === undefined ? "hidden" : "button"} onClick={this.loadNextImage}>
                        Show Next Image
                    </button> */}
                </header>
                {this.cur_image_name !== null &&
                    <Ulabel
                        QASM = {this.QASM}
                        image = {this.images[this.cur_image_name]}
                        // image = "https://stand-qa-data.s3.amazonaws.com/mfstand/2022/1051-Thonbontle/AckermannJWSP1A/100722T140321/RGB/4073bc341e_IMG_00001_87.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAW5KI54GSNNLMH2WB%2F20221115%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221115T221851Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEP7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIDvcVmRGyZKpBNqThlB2FG6nJ8kyWFAncdXXCnCM9hQuAiAFHqGjjJSRAwQq2MAhgx4fVCFIB9UL%2FjYMa8ODZqdNTyqDAwj3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAIaDDQ3NTI4MzcxMDM3MiIMERSVpRVXWQLonzRBKtcCIFIbZLOWm7D4ZwEnZHT8dyCdSC4vCwYnjKC0ysvMRxfDdDK1WybnWKZ9AjpaPh3pXur1X184nm7%2Bg8%2BTrJ1XHwH79%2FeUl38BzOEQdjoOFeY5gRVTotI5IaEW6auWdycF3i2dyt%2BNd0V%2FmQQ00Wi8g0owlPQUrRVK0m5Ei9ssJCP96ZicX%2BLbu2AujWABZO%2Bf9mGfuj1NHoiWU1z9wvuks%2BxHH56dh1fkxUFnx9UIHZYEa%2FhKax3bmJBD8xbPo9BZdWCPm1kkTQSsqIdPKuNCkXJWqkMy4kb8iKw7kq0cHJ06mlSzySVC%2Fh8bJThhwEBCafRMNOostQ5kDPOi5aO7qPqearX9AhsdUU5IE%2Fn79BjMkX1L7EoDCyuCkMXpUmt8jGopN3k4iNB%2BiambfklQqxUJ%2F4ZYGQrpTKeXdxBrYsqHwdWlJacl7cP1UHERuwgRIIvhgRAWuTDSldCbBjqfAXwhvTcfSw5dgOlt9msaBYH2XzZQUfLsF%2B%2Fk6%2BNx2e0byINaM6qP1V2BZcb4%2FspOyj5VUT408MRHJY3KLdjRgIgcySS8HCyCtvxnIUFCjpl0oxCzEWK49aRb6VrpeAIvQ59SalParnBpSoNacECzFI%2FJ0vTL9epZFoLY7sTB8E%2Bu0tuMyi2Eu%2F51BrzvhtpSKGr2aEYdGCdaQtxBEKjrPQ%3D%3D&X-Amz-Signature=06554c4952c06a5db6b7e9c00c92611bb7620b1d5c61a42153b0b20a9e6443d1"
                        subtasks = {this.subtasks}
                    />
                }
            </div>
        )
    }
}

export default ImageLabeler;