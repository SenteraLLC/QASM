import { Component } from 'react';
import GridImage from "./GridImage.js";
const { call_backend } =  require("../QASM/utils.js");
const { function_names } = require("../../public/electron_constants.js");

class Grid extends Component {
    images = {};
    image_names = [];
    grid_width = 2;
    grid_image_names = [];
    src = "";
    classes = [];
    labels = {};   
    component_updater = 0; 

    constructor(props) {
        super(props);
        
        // Initialize props
        this.grid_width   = props.grid_width   || 2;
        this.classes      = props.classes      || ["plant", "rogue"];
        this.src          = props.src
        this.css_by_class = props.css_by_class 

        this.state = {
            labels: this.labels,
            src: this.src,
        };
        
        // Initial setup
        this.loadImages();

        // Bind functions
        this.loadImages        = this.loadImages.bind(this);
        this.saveLabels        = this.saveLabels.bind(this);
        this.loadLabels        = this.loadLabels.bind(this);
        this.clearAll          = this.clearAll.bind(this);
        this.selectImageDir    = this.selectImageDir.bind(this);
        this.changeGridWidth   = this.changeGridWidth.bind(this);
        this.updateState       = this.updateState.bind(this);
        this.updateLocalLabels = this.updateLocalLabels.bind(this);
    }

    
    updateState() {
        this.setState({
            labels: this.labels,
            src: this.src,
        });
        this.component_updater++;
    }

    async loadImages() {
        console.log("Src: " + this.src);
        this.images = await call_backend(window, function_names.LOAD_IMAGES, this.src);
        this.image_names = Object.keys(this.images);
        this.gridSetup();
        this.clearAll();
    }

    gridSetup() {
        // Divide grid based on the grid width prop
        let cur_im;
        let grid_counter = 0;
        let row_imgs = [];
        this.grid_image_names = [];
        for (let i = 0; i < this.image_names.length; i++) {
            cur_im = this.image_names[i];

            // Add to grid
            if (grid_counter >= this.grid_width) {
                this.grid_image_names.push(row_imgs);
                grid_counter = 0;
                row_imgs = [];
            }
            grid_counter++;
            row_imgs.push(cur_im);
        }
        this.grid_image_names.push(row_imgs);
    }

    updateLocalLabels() {
        // Get state of each GridImage
        this.labels = {};
        for (let i=0; i < this.image_names.length; i++) {
            let image_name = this.image_names[i];
            let class_name = document.getElementById(image_name).classList[1];
            this.labels[image_name] = {
                "class": class_name
            }
        }
    }

    async saveLabels() {
        this.updateLocalLabels();
        console.log(this.labels);
        console.log(await call_backend(window, function_names.SAVE_FILE, this.labels));
    }

    async loadLabels() {
        // Load in previous labels
        this.labels = await call_backend(window, function_names.LOAD_LABELS);
        console.log(this.labels);
        
        if (Object.keys(this.labels).length > 0) {
            // Update state to rerender page
            this.updateState();
        } else {
            console.log("Prevented loading empty labels.");
        }
    }

    clearAll() {
        // Set all classes to the default
        this.labels = {};
        this.updateState();
    }

    async selectImageDir() {
        let dir_path = await call_backend(window, function_names.OPEN_DIR);
        this.src = dir_path;
        await this.loadImages();
        this.updateState();
    }
    
    changeGridWidth(e) {
        // Get current grid width
        this.grid_width = e.target.value;

        // Store current labels
        this.updateLocalLabels();

        // Reformat grid
        this.gridSetup(); 

        // Update page
        this.updateState();
    }

    render() {
        return (
            <div className="Grid" key={this.component_updater}>
                <button 
                    onClick={this.selectImageDir} 
                    style={{"marginBottom":"16px"}}>
                    Select Directory
                </button>
                &nbsp;&nbsp;&nbsp;
                <p style={{"display": "inline-block"}}>Grid Width:</p>
                &nbsp;
                <input 
                    type="number" 
                    value={this.grid_width} 
                    size={2} // Number of visible digits
                    step={1} 
                    min={1}
                    max={99}
                    onChange={this.changeGridWidth}>
                </input><br/>
                <button onClick={this.loadLabels}>Load Labels</button>
                &nbsp;&nbsp;&nbsp;
                <button onClick={this.saveLabels}>Save Labels</button>
                &nbsp;&nbsp;&nbsp;
                <button onClick={this.clearAll}>Clear All</button>
                <table id="Grid-table">
                    <tbody>
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