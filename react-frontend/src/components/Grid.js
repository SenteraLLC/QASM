import { Component } from 'react';
import GridImage from "./GridImage.js";
const { call_backend, file_name_to_valid_id, update_all_overlays } =  require("../QASM/utils.js");
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
    image_stack = []; 
    hover_image_id = null;

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

        // Update the overlays whenever the page size is changed
        window.addEventListener("resize", update_all_overlays);

        // Update which image is currently being hovered
        document.addEventListener("mousemove", (e) => {
            if (e.target.className.includes("hover-target")) {
                // Every single hover-target will be inside of a div that's 
                // inside of a div, that has the id that we're trying to select.
                this.hover_image_id = e.target.parentNode.parentNode.id
            } 
            else {
                this.hover_image_id = null
            }
        });

        // Prevent weird behavior when scrolling
        window.addEventListener("scroll", () => {
            this.hover_image_id = null;
        }); 

        // Keybinds
        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                this.saveLabels();
            }

            if (this.hover_image_id !== null && e.key === "b") {
                this.changeImage(this.hover_image_id);
            }
        });

        // Bind functions
        this.loadImages          = this.loadImages.bind(this);
        this.saveLabels          = this.saveLabels.bind(this);
        this.loadLabels          = this.loadLabels.bind(this);
        this.clearAll            = this.clearAll.bind(this);
        this.selectImageDir      = this.selectImageDir.bind(this);
        this.changeGridWidth     = this.changeGridWidth.bind(this);
        this.updateState         = this.updateState.bind(this);
        this.updateLocalLabels   = this.updateLocalLabels.bind(this);
        this.loadAndFormatImages = this.loadAndFormatImages.bind(this);
        this.addImageLayer       = this.addImageLayer.bind(this);
        this.getImageStackByName = this.getImageStackByName.bind(this);
        this.changeImage         = this.changeImage.bind(this);
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
        this.images = await this.loadAndFormatImages(this.src);
        console.log(this.images);
        this.image_names = Object.keys(this.images);
        this.gridSetup();
        this.clearAll();
    }

    async loadAndFormatImages(dir_path) {
        let raw_images = await call_backend(window, function_names.LOAD_IMAGES, dir_path);
        let images = {};
        let image_name;
        // Remove extension, leaving only image name
        Object.keys(raw_images).forEach((name) => {
            image_name = file_name_to_valid_id(name);
            // Rebuild images array using extensionless names
            images[image_name] = raw_images[name];
        });
        return images;
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
        if (dir_path !== undefined) {
            this.src = dir_path;
            await this.loadImages();
            this.updateState();
        } else {
            console.log("Prevented loading invalid directory.");
        }
    }

    async addImageLayer() {
        // Prompt user to select directory
        let dir_path = await call_backend(window, function_names.OPEN_DIR);

        // Load images and add them to the image stack
        let image_layer = await this.loadAndFormatImages(dir_path);
        if (Object.keys(image_layer).length === 0) {
            console.log("Prevent adding empty layer.");
        } else {
            this.image_stack.push(image_layer);
        }   
        console.log(this.image_stack);
        this.getImageStackByName(this.image_names[0]);
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

    getImageStackByName(image_name) {
        let image_stack = [];
        for (let image_layer of this.image_stack) {
            if (image_name in image_layer) {
                image_stack.push(image_layer[image_name]);
            }
        }
        return(image_stack);
    }

    changeImage(hover_image_id) {
        // firstChild = image holder div
        // childNodes of image holder div = image layers

        let layers = document.getElementById(hover_image_id).firstChild.childNodes;
        for (let idx = 0; idx < layers.length; idx++) {
            let layer = layers[idx];
            // Skip overlays and hidden images
            if (layer.id.includes("overlay") || layer.classList.contains("hidden")) {
                continue;
            }
            
            // Change currently shown image to hidden
            layer.classList.add("hidden");

            // Change next hidden image to shown
            if (idx+1 === layers.length) {
                // If we're at the last layer, turn on the og image
                layers[1].classList.remove("hidden");
            } else {
                // Un-hide next image
                layers[idx+1].classList.remove("hidden");
            }
            // Done
            break;
        }
    }

    render() {
        return (
            <div className="Grid" key={this.component_updater}>
                <button 
                    onClick={this.selectImageDir}>
                    Select Directory
                </button>
                &nbsp;&nbsp;&nbsp;
                <button 
                    onClick={this.addImageLayer}>
                    Add Image Layer
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
                                            image_stack={
                                                this.getImageStackByName(image_name)
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

    componentDidUpdate() {
        // Update overlays
        update_all_overlays();
    }
}

export default Grid;