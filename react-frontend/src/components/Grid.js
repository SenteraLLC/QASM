import { Component } from 'react';
import GridImage from "./GridImage.js";
// const webpack = require("webpack");

class Grid extends Component {
    images = {};
    image_names = [];
    GRID_WIDTH = 2;
    grid_image_names = [];
    image_src = "";
    classes = [];    

    constructor(props) {
        super(props);
        
        // Initialize props
        this.GRID_WIDTH   = props.grid_width   || 2;
        this.image_src    = props.src          || "../data/images"; 
        this.classes      = props.classes      || ["plant", "rogue"];
        this.css_by_class = props.css_by_class 

        // console.log(IMAGE_SRC_PATH);
        // new webpack.DefinePlugin({ IMAGE_SRC: JSON.stringify(this.image_src) });

        // Organize images
        // console.log(IMAGE_SRC);
        this.images = this.importAll(require.context("../data/images", false, /\.(png|jpe?g|svg|JPG|PNG)$/));
        this.image_names = Object.keys(this.images);
        this.gridSetup();

        // Bind functions
        this.saveLabels = this.saveLabels.bind(this);
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
        console.log(await window.electron.invoke("saveLabels", labels));
    }

    render() {
        return (
            <div className="Grid">
                <button onClick={this.saveLabels}>Save Labels</button>
                <table id="Grid-table">
                    <tbody>
                        {this.grid_image_names.map(row_image_names => (
                            <tr key={this.grid_image_names.indexOf(row_image_names)}>
                                {row_image_names.map(image_name => (
                                    <td key={image_name}>
                                        <GridImage 
                                            image={this.images[image_name]} 
                                            image_name={image_name} 
                                            classes={this.classes}
                                            css_by_class={this.css_by_class}
                                            // default_class={this.classes[0]}
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