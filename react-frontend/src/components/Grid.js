import { Component } from 'react';
import GridImage from "./GridImage.js";
import { call_backend } from '../QASM/utils.js';
const { function_names } = require("../../public/electron_constants.js");

class Grid extends Component {
    images = {};
    image_names = [];
    GRID_WIDTH = 2;
    grid_image_names = [];
    image_src = "";
    classes = [];
    labels = {};   
    component_updater = 0; 

    constructor(props) {
        super(props);
        
        // Initialize props
        this.GRID_WIDTH   = props.grid_width   || 2;
        this.image_src    = props.src          || "../data/images"; 
        this.classes      = props.classes      || ["plant", "rogue"];
        this.css_by_class = props.css_by_class 

        this.state = {
            labels: this.labels
        };

        // console.log(IMAGE_SRC_PATH);
        // new webpack.DefinePlugin({ IMAGE_SRC: JSON.stringify(this.image_src) });

        // Organize images
        // console.log(IMAGE_SRC);
        this.images = this.importAll(require.context("../data/images", false, /\.(png|jpe?g|svg|JPG|PNG)$/));
        this.image_names = Object.keys(this.images);
        this.gridSetup();

        // Bind functions
        this.saveLabels = this.saveLabels.bind(this);
        this.loadLabels = this.loadLabels.bind(this);
    }

    
    importAll(r) {
        // Get all images in a folder
        let ret = {}
        r.keys().forEach((key) => (ret[key.slice(2)] = r(key)));
        return ret;
    }

    gridSetup() {
        // Divide grid based on the grid width prop
        let cur_im;
        let grid_counter = 0;
        let row_imgs = [];
        for (let i = 0; i < this.image_names.length; i++) {
            cur_im = this.image_names[i];

            // Add to grid
            if (grid_counter >= this.GRID_WIDTH) {
                this.grid_image_names.push(row_imgs);
                grid_counter = 0;
                row_imgs = [];
            }
            grid_counter++;
            row_imgs.push(cur_im);
        }
        this.grid_image_names.push(row_imgs);
    }

    async saveLabels() {
        // Get state of each GridImage
        let labels = {};
        for (let i=0; i < this.image_names.length; i++) {
            let image_name = this.image_names[i];
            let class_name = document.getElementById(image_name).classList[1];
            labels[image_name] = {
                "class": class_name
            }
        }
        console.log(labels);
        console.log(await call_backend(window, function_names.SAVE_LABELS, labels));
    }

    async loadLabels() {
        // Load in previous labels
        this.labels = await call_backend(window, function_names.LOAD_LABELS);
        console.log(this.labels);
        
        if (Object.keys(this.labels).length > 0) {
            // Update state to rerender page
            this.setState({
                class: this.labels
            });

            // Update key to force rebuild of grid
            this.component_updater++;
        } else {
            console.log("Prevented loading empty labels.");
        }
    }

    render() {
        return (
            <div className="Grid">
                <button onClick={this.loadLabels}>Load Labels</button>
                <button onClick={this.saveLabels}>Save Labels</button>
                <table id="Grid-table">
                    <tbody key={this.component_updater}>
                        {this.grid_image_names.map(row_image_names => (
                            <tr key={"row_" + this.grid_image_names.indexOf(row_image_names)}>
                                {row_image_names.map(image_name => (
                                    <td key={image_name}>
                                        <GridImage
                                            image={this.images[image_name]} 
                                            image_name={image_name} 
                                            classes={this.classes}
                                            css_by_class={this.css_by_class}
                                            default_class={
                                                image_name in this.labels 
                                                    ? this.labels[image_name]["class"] 
                                                    : this.classes[0]
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>        
        )
    }
}

export default Grid;