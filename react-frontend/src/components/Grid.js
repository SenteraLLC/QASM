import { Component, Fragment } from 'react';
import GridImage from "./GridImage.js";
import Dropdown from './Dropdown.js';
import x_overlay from "../icons/x.svg";
import x_overlay_red from "../icons/x_red.svg";
import x_overlay_yellow from "../icons/x_yellow.svg";
import x_overlay_white from "../icons/x_white.svg";
import x_overlay_green from "../icons/x_green.svg";
import criss_cross from "../icons/criss_cross.svg";
import curved from "../icons/curved.svg";
import sparse from "../icons/sparse.svg";
import field_edge from "../icons/field_edge.svg";
import "../css/Grid.css";
const { update_all_overlays } =  require("../QASM/utils.js");
const { FILTER_MODES, initProps, addAllEventListeners, removeAllEventListeners, changeGridWidth, toggleImageHidden, initLabels, loadLabels, changeAutoLoadOnDirSelect, saveLabels, clearAllLabels, addImageLayer, getImageStackByName, selectImageDir} =  require("../QASM/grid_utils.js");

const my_overlay = <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 223 53" style="enable-background:new 0 0 223 53;" xml:space="preserve">
<style type="text/css">
	.st0{fill:#FFFFFF;}
	.st1{fill:#799B3E;}
</style>
<path class="st0" d="M126.707,14.844c-1.44-0.944-3.089-1.417-4.947-1.417c-1.828,0-3.52,0.424-5.074,1.269
	c-1.554,0.846-2.972,2.121-4.251,3.828v-4.457h-3.199v24.866h3.199v-9.119c0-3.276,0.153-5.53,0.457-6.765
	c0.488-1.889,1.497-3.474,3.03-4.754c1.531-1.28,3.264-1.92,5.2-1.92c1.692,0,3.063,0.416,4.114,1.246
	c1.051,0.831,1.763,2.068,2.133,3.714c0.238,0.959,0.356,2.872,0.356,5.736v11.862h3.2V26.135c0-3.383-0.343-5.874-1.029-7.474
	C129.21,17.062,128.148,15.79,126.707,14.844z M67.056,24.786c-1.954-1.005-3.237-1.882-3.847-2.628
	c-0.611-0.732-0.917-1.5-0.917-2.308c0-0.914,0.371-1.714,1.112-2.4c0.741-0.685,1.631-1.028,2.67-1.028
	c1.634,0,3.307,0.83,5.018,2.491l2.057-2.125c-2.32-2.24-4.625-3.359-6.913-3.359c-1.97,0-3.598,0.625-4.888,1.874
	c-1.29,1.25-1.935,2.819-1.935,4.708c0,1.448,0.405,2.735,1.214,3.863c0.809,1.127,2.336,2.27,4.581,3.428
	c2.091,1.067,3.435,1.95,4.03,2.652c0.595,0.715,0.893,1.531,0.893,2.445c0,1.113-0.451,2.08-1.351,2.902
	c-0.901,0.823-1.993,1.235-3.276,1.235c-1.833,0-3.566-0.922-5.2-2.766l-2.011,2.286c0.855,1.097,1.934,1.957,3.239,2.582
	c1.304,0.625,2.674,0.938,4.108,0.938c2.152,0,3.945-0.709,5.379-2.126c1.435-1.417,2.152-3.146,2.152-5.188
	c0-1.447-0.421-2.75-1.26-3.908C71.056,27.21,69.438,26.021,67.056,24.786z M100.525,18.25c-2.531-3.215-5.917-4.823-10.156-4.823
	c-4.118,0-7.405,1.57-9.86,4.708c-1.936,2.468-2.905,5.28-2.905,8.434c0,3.352,1.144,6.357,3.432,9.015
	c2.287,2.66,5.458,3.988,9.516,3.988c1.83,0,3.469-0.278,4.918-0.834s2.753-1.368,3.912-2.434c1.159-1.066,2.181-2.468,3.065-4.205
	l-2.697-1.417c-0.976,1.624-1.885,2.8-2.724,3.528c-0.839,0.729-1.857,1.313-3.054,1.753c-1.198,0.441-2.43,0.661-3.695,0.661
	c-2.624,0-4.828-0.924-6.613-2.771c-1.785-1.847-2.708-4.214-2.769-7.103h22.374C103.24,23.355,102.325,20.52,100.525,18.25z
	 M81.216,23.987c0.656-2.286,1.624-4,2.906-5.143c1.754-1.569,3.852-2.354,6.293-2.354c1.48,0,2.89,0.312,4.234,0.937
	c1.342,0.626,2.421,1.448,3.238,2.468c0.816,1.021,1.438,2.385,1.865,4.091L81.216,23.987L81.216,23.987z M219.76,14.067v4.571
	c-1.25-1.737-2.701-3.04-4.353-3.908c-1.655-0.868-3.501-1.302-5.543-1.302c-3.535,0-6.559,1.272-9.073,3.816
	c-2.514,2.545-3.771,5.607-3.771,9.187c0,3.657,1.245,6.761,3.737,9.313c2.491,2.552,5.496,3.828,9.016,3.828
	c1.981,0,3.805-0.411,5.473-1.233c1.669-0.823,3.173-2.049,4.514-3.68v4.274h3.154V14.067H219.76z M218.698,31.717
	c-0.846,1.507-2.05,2.701-3.617,3.585c-1.568,0.882-3.227,1.324-4.978,1.324c-1.735,0-3.359-0.445-4.873-1.336
	c-1.514-0.89-2.721-2.135-3.618-3.733c-0.898-1.597-1.346-3.272-1.346-5.023c0-1.765,0.444-3.439,1.335-5.022
	s2.089-2.811,3.596-3.687c1.507-0.875,3.15-1.312,4.93-1.312c2.77,0,5.102,0.966,6.997,2.899c1.895,1.933,2.842,4.338,2.842,7.214
	C219.965,28.514,219.543,30.211,218.698,31.717z M143.768,4.835h-3.199v9.233h-4.365v2.766h4.365v22.1h3.199v-22.1h5.074v-2.766
	h-5.074V4.835z M189.203,14.491c-1.082,0.708-2.111,1.779-3.085,3.212v-3.634h-3.268v24.866h3.268v-8.411
	c0-4.312,0.197-7.177,0.593-8.593c0.519-1.843,1.272-3.203,2.263-4.08c0.99-0.876,2.019-1.314,3.085-1.314
	c0.457,0,1.021,0.145,1.691,0.434l1.669-2.697c-1.006-0.564-1.951-0.846-2.835-0.846C191.412,13.427,190.285,13.782,189.203,14.491z
	 M175.35,18.25c-2.53-3.215-5.916-4.823-10.156-4.823c-4.117,0-7.404,1.57-9.859,4.708c-1.936,2.468-2.905,5.28-2.905,8.434
	c0,3.352,1.144,6.357,3.432,9.015c2.287,2.66,5.458,3.988,9.515,3.988c1.83,0,3.469-0.278,4.919-0.834
	c1.449-0.556,2.752-1.368,3.912-2.434c1.159-1.066,2.181-2.468,3.064-4.205l-2.696-1.417c-0.977,1.624-1.885,2.8-2.724,3.528
	c-0.839,0.729-1.857,1.313-3.054,1.753c-1.198,0.441-2.43,0.661-3.695,0.661c-2.625,0-4.828-0.924-6.613-2.771
	s-2.708-4.214-2.77-7.103h22.375C178.066,23.355,177.15,20.52,175.35,18.25z M156.041,23.987c0.656-2.286,1.624-4,2.906-5.143
	c1.754-1.569,3.852-2.354,6.293-2.354c1.479,0,2.89,0.312,4.234,0.937c1.342,0.626,2.421,1.448,3.238,2.468
	c0.816,1.021,1.438,2.385,1.865,4.091L156.041,23.987L156.041,23.987z"/>
<path class="st1" d="M33.978,32.35c0-1.076-0.873-1.95-1.949-1.95c-1.077,0-1.95,0.874-1.95,1.95c0,1.077,0.873,1.95,1.95,1.95
	C33.105,34.299,33.978,33.426,33.978,32.35z M20.327,30.396c-1.075,0-1.95,0.873-1.95,1.95c0,1.077,0.874,1.95,1.95,1.95
	c1.078,0,1.95-0.873,1.95-1.95C22.277,31.269,21.404,30.396,20.327,30.396z M26.182,22.602c1.078,0,1.95-0.873,1.95-1.95
	c0-1.077-0.873-1.95-1.95-1.95c-1.076,0-1.948,0.873-1.948,1.95S25.105,22.602,26.182,22.602z M18.377,20.654
	c0,1.078,0.874,1.95,1.95,1.95c1.078,0,1.95-0.873,1.95-1.95c0-1.077-0.873-1.95-1.95-1.95
	C19.251,18.703,18.377,19.577,18.377,20.654z M26.182,34.294c1.078,0,1.95-0.873,1.95-1.948c0-1.079-0.873-1.95-1.95-1.95
	c-1.076,0-1.948,0.872-1.948,1.95C24.234,33.421,25.105,34.294,26.182,34.294z M20.327,24.548c-1.075,0-1.95,0.873-1.95,1.95
	c0,1.076,0.874,1.95,1.95,1.95c1.078,0,1.95-0.873,1.95-1.95S21.404,24.548,20.327,24.548z M26.182,28.447
	c1.078,0,1.95-0.873,1.95-1.95c0-1.077-0.873-1.95-1.95-1.95c-1.076,0-1.948,0.873-1.948,1.95
	C24.234,27.574,25.105,28.447,26.182,28.447z M32.029,24.551c-1.077,0-1.95,0.873-1.95,1.95c0,1.077,0.873,1.95,1.95,1.95
	c1.076,0,1.949-0.873,1.949-1.95C33.978,25.425,33.105,24.551,32.029,24.551z M32.029,22.607c1.076,0,1.949-0.873,1.949-1.95
	c0-1.077-0.873-1.949-1.949-1.949c-1.077,0-1.95,0.872-1.95,1.949C30.078,21.734,30.952,22.607,32.029,22.607z M26.178,41.572
	c1.475,0,2.67-1.196,2.67-2.671c0-1.474-1.195-2.672-2.67-2.672s-2.673,1.198-2.673,2.672S24.703,41.572,26.178,41.572z
	 M26.178,11.429c-1.475,0-2.673,1.198-2.673,2.673c0,1.474,1.198,2.67,2.673,2.67s2.67-1.196,2.67-2.67
	C28.848,12.627,27.653,11.429,26.178,11.429z M38.577,23.829c-1.473,0-2.67,1.197-2.67,2.672c0,1.476,1.197,2.672,2.67,2.672
	c1.476,0,2.673-1.196,2.673-2.672C41.249,25.026,40.052,23.829,38.577,23.829z M13.779,29.173c1.474,0,2.671-1.196,2.671-2.672
	c0-1.475-1.197-2.672-2.671-2.672c-1.475,0-2.672,1.197-2.672,2.672C11.107,27.976,12.304,29.173,13.779,29.173z M36.671,33.797
	c-0.818,0-1.636,0.313-2.261,0.937c-1.249,1.247-1.249,3.272,0,4.52c1.247,1.248,3.272,1.248,4.521,0
	c1.247-1.248,1.247-3.273,0-4.52C38.306,34.109,37.488,33.797,36.671,33.797z M17.946,18.27c1.249-1.25,1.249-3.273,0-4.522
	c-0.624-0.624-1.442-0.936-2.261-0.936c-0.818,0-1.636,0.312-2.26,0.936c-1.248,1.248-1.248,3.272,0,4.522
	C14.674,19.518,16.698,19.518,17.946,18.27z M36.67,12.812c-0.818,0-1.635,0.312-2.259,0.936c-1.249,1.248-1.249,3.272,0,4.522
	c1.249,1.248,3.272,1.248,4.521,0c1.247-1.25,1.247-3.273,0-4.522C38.306,13.124,37.488,12.812,36.67,12.812z M13.425,34.733
	c-1.248,1.247-1.248,3.272,0,4.52c1.249,1.248,3.273,1.249,4.521,0c1.249-1.248,1.249-3.273,0-4.52
	c-0.624-0.624-1.442-0.937-2.261-0.937C14.867,33.797,14.049,34.109,13.425,34.733z M26.178,43.718
	c-2.215,0-4.013,1.795-4.013,4.012c0,2.215,1.798,4.014,4.013,4.014s4.012-1.799,4.012-4.014
	C30.19,45.513,28.393,43.718,26.178,43.718z M26.178,9.285c2.215,0,4.012-1.797,4.012-4.013c0-2.217-1.797-4.014-4.012-4.014
	s-4.013,1.797-4.013,4.014C22.165,7.488,23.961,9.285,26.178,9.285z M43.392,26.501c0,2.216,1.799,4.013,4.015,4.013
	c2.215,0,4.013-1.797,4.013-4.013s-1.798-4.013-4.013-4.013C45.19,22.488,43.392,24.285,43.392,26.501z M8.961,26.501
	c0-2.216-1.797-4.013-4.012-4.013c-2.217,0-4.014,1.797-4.014,4.013s1.797,4.013,4.014,4.013
	C7.164,30.514,8.961,28.717,8.961,26.501z M7.033,31.665c-0.581,0-1.173,0.128-1.732,0.396c-1.998,0.958-2.842,3.354-1.884,5.352
	c0.959,1.999,3.356,2.842,5.353,1.885c1.998-0.958,2.841-3.356,1.883-5.354C9.964,32.506,8.529,31.665,7.033,31.665z M47.055,20.94
	c1.998-0.957,2.841-3.356,1.881-5.352c-0.689-1.439-2.125-2.279-3.62-2.279c-0.581,0-1.172,0.127-1.731,0.396
	c-1.999,0.958-2.842,3.355-1.883,5.353C42.659,21.055,45.056,21.9,47.055,20.94z M35.351,41.629
	c-0.581,0.001-1.171,0.128-1.73,0.396c-1.998,0.958-2.842,3.356-1.883,5.353c0.957,1.998,3.355,2.842,5.353,1.884
	c1.998-0.957,2.841-3.356,1.883-5.353C38.284,42.47,36.848,41.629,35.351,41.629z M18.735,10.977
	c1.997-0.958,2.842-3.356,1.882-5.353c-0.688-1.438-2.123-2.279-3.618-2.279h-0.002c-0.581,0-1.173,0.126-1.733,0.396
	c-1.998,0.957-2.841,3.354-1.883,5.353C14.339,11.092,16.737,11.936,18.735,10.977z M18.204,44.021
	c-0.603-0.275-1.234-0.404-1.857-0.404c-1.705,0-3.335,0.977-4.087,2.629c-1.027,2.255-0.031,4.915,2.225,5.942
	c0.576,0.262,1.178,0.392,1.775,0.403h0.163c1.675-0.03,3.263-1.002,4.004-2.627C21.454,47.708,20.458,45.048,18.204,44.021z
	 M34.152,8.98c2.256,1.027,4.918,0.031,5.943-2.224c1.026-2.255,0.03-4.916-2.224-5.943c-0.603-0.275-1.234-0.404-1.856-0.404
	c-1.704,0-3.335,0.977-4.086,2.629C30.9,5.293,31.897,7.954,34.152,8.98z M49.641,32.25c-0.603-0.273-1.233-0.404-1.855-0.404
	c-1.706,0-3.335,0.977-4.087,2.629c-1.026,2.255-0.031,4.917,2.224,5.944c2.255,1.027,4.917,0.029,5.942-2.225
	C52.892,35.938,51.896,33.276,49.641,32.25z M2.716,20.752c2.254,1.026,4.914,0.029,5.942-2.225c1.025-2.256,0.03-4.916-2.227-5.942
	C5.829,12.31,5.197,12.18,4.575,12.18c-1.705,0.001-3.334,0.977-4.086,2.629c-0.273,0.599-0.402,1.225-0.404,1.842v0.03
	C0.092,18.38,1.068,20.001,2.716,20.752z"/>
</svg>


const COLORS = {
    "default": "default",
    "red": "red",
    "yellow": "yellow",
    "white": "white",
    "green": "green",
}

const OVERLAYS = {
    "x_overlay": {
        [COLORS.default]: x_overlay,
        [COLORS.red]: x_overlay_red,
        [COLORS.yellow]: x_overlay_yellow,
        [COLORS.white]: x_overlay_white,
        [COLORS.green]: x_overlay_green,
    },
    "criss_cross": {
        [COLORS.default]: criss_cross
    },
    "curved": {
        [COLORS.default]: curved
    },
    "sparse": {
        [COLORS.default]: sparse
    },
    "field_edge": {
        [COLORS.default]: field_edge
    }
}

class Grid extends Component {
    constructor(props) {
        super(props);
        
        // Initialize props
        initProps(window, document, this, props);
        
        // Get overlay info
        this.initOverlays();

        // Bind functions
        this.updateLocalLabels     = this.updateLocalLabels.bind(this);
        this.initOverlays          = this.initOverlays.bind(this);
        this.changeGridFilter      = this.changeGridFilter.bind(this);
        this.getClassFromImageName = this.getClassFromImageName.bind(this);
    }


    /**
     * Run through the classes list and
     * check for supported overlays
     */
    initOverlays() {
        // Render stock overlays
        for (let [idx, class_props] of this.classes.entries()) {
            if (
                "svg_overlay" in class_props && 
                class_props["svg_overlay"] in OVERLAYS
            ) {
                let overlay_type = class_props.svg_overlay;
                "color" in class_props && class_props["color"] in COLORS 
                    ? class_props.svg_overlay = OVERLAYS[overlay_type][COLORS[class_props.color]]
                    : class_props.svg_overlay = OVERLAYS[overlay_type]["default"]
                this.classes[idx] = class_props;
            }
        }

        // Grab the document's head tag and create a style tag
        let document_head = document.getElementsByTagName('head')[0];
        let style = document.createElement('style');

        // Loop through all classes and append each classes' overlay opacity to it
        for (let each_class of this.classes) {
            if (each_class.svg_overlay == null) {
                // If the overlay doesn't exist don't show it
                style.textContent += `div.${each_class.class_name} > * > img.overlay {
                    filter: opacity(0)
                }
                `;
            }
            else if (each_class.opacity !== undefined) {
                // Use the custom overlay opacity
                style.textContent += `div.${each_class.class_name} > * > img.overlay {
                    filter: opacity(${each_class.opacity})
                }
                `;
            }
            else {
                // Use the default opacity
                style.textContent += `div.${each_class.class_name} > * > img.overlay {
                    filter: opacity(1)
                }
                `;
            }
        }

        // Append the newly created style tag to the documet head
        document_head.appendChild(style);
    }
    

    /**
     * Scrape the page for all the current labels
     */
    updateLocalLabels() {
        // Get state of each GridImage
        this.labels = initLabels(this); // Gen new object w/datetime
        for (let i=0; i < this.image_names.length; i++) {
            let image_name = this.image_names[i];
            let class_name = document.getElementById(image_name).classList[1];
            this.labels[image_name] = {
                "class": class_name
            }
        }
    }


    /**
     * Get the class name from the image name
     * 
     * @param {string} image_name
     * @returns {string} class name
     */
    getClassFromImageName(image_name) {
        // Default to the first class
        let _class = this.classes[0].class_name;
        if (image_name in this.labels) {
            _class = this.labels[image_name]["class"]
            // If class name is not in the classes list, clear the labels
            if (!this.classes.find(x => x.class_name === _class)) {
                alert("Class name '" + _class + "' not found in classes list, clearing loaded labels.");
                this.labels = {};
            }
        }
        return _class
    }


    /**
     * Change the filtered class and put it at the top
     * 
     * @param {string} class_name 
     */
    changeGridFilter(class_name) {
        this.filtered_class_name = class_name;
        // Toggle hidden class on images that don't match the filter
        for (let image_name of this.image_names) {
            switch (this.filtered_class_name) {
                case FILTER_MODES.no_filter:
                    // Show all images
                    toggleImageHidden(document, image_name, false);
                    break;
                default:
                    if (this.filtered_class_name === null || this.filtered_class_name === undefined) {
                        // Show all images if no filter is selected
                        toggleImageHidden(document, image_name, false);
                    } else if (
                        !(image_name in this.labels) ||
                        this.labels[image_name]["class"] !== this.filtered_class_name
                    ) {
                        // Hide images with no labels or that don't match the filter
                        toggleImageHidden(document, image_name, true);
                    } else if (this.labels[image_name]["class"] === this.filtered_class_name) {
                        // Show images that match the filter
                        toggleImageHidden(document, image_name, false);
                    }
            }
        }
        this.updateLocalLabels(); // Update current labels
    }


    render() {
        return (
            <div className="Grid" key={this.component_updater}>
                <div className="header-container">
                    {this.src !== "" &&
                        <h2>{this.src}</h2>
                    }
                    {/* TODO: Reimplement so that it looks nice */}
                    {/* <Legend
                        classes={this.classes}
                    /> */}
                    <div className={this.images_shown ? "hidden" : "controls-container"}>
                        <button
                            onClick={() => selectImageDir(window, this)}
                            className="button">
                            Select Directory
                        </button>
                        <div className="change-grid-width-container">
                            <label>
                                Filter By Class:
                            </label>
                            <Dropdown
                                items={[...Object.values(FILTER_MODES), ...this.class_names]}
                                callback={(selected_class_name) => this.changeGridFilter(selected_class_name)}
                            />
                            <label htmlFor="change-grid-width-og">
                                Grid Width:
                            </label>
                            <input 
                                id="change-grid-width-og"
                                type="number" 
                                defaultValue={this.grid_width} 
                                size={2} // Number of visible digits
                                step={1} 
                                min={1}
                                max={99}
                                onChange={(event) => changeGridWidth(event, this, document)}>
                            </input>
                        </div>
                        <div className="change-grid-width-container">
                            <label>
                                Autoload Labels on Directory Select:
                            </label>
                            <input
                                type="checkbox"
                                name={"autoload_labels_on_dir_select"}
                                id={"autoload_labels_on_dir_select"}
                                onChange={() => changeAutoLoadOnDirSelect(this)}
                                checked={this.autoload_labels_on_dir_select}
                            ></input>
                        </div>
                    </div>
                    <div className={this.images_shown ? "controls-container" : "hidden"}>
                        <button
                            onClick={() => selectImageDir(window, this)}
                            className="button">
                            Select Directory
                        </button>
                        <button 
                            onClick={() => addImageLayer(window, this)}
                            className="button">
                            Add Image Layer
                        </button>
                        <div className="change-grid-width-container">
                            <label>
                                Filter By Class:
                            </label>
                            <Dropdown
                                items={[...Object.values(FILTER_MODES), ...this.class_names]}
                                callback={(selected_class_name) => this.changeGridFilter(selected_class_name)}
                            />
                            <label htmlFor="change-grid-width-new">
                                Grid Width:
                            </label>
                            <input 
                                id="change-grid-width-new"
                                type="number" 
                                defaultValue={this.grid_width} 
                                size={2} // Number of visible digits
                                step={1} 
                                min={1}
                                max={99}
                                onChange={(event) => changeGridWidth(event, this, document)}>
                            </input>
                        </div>
                        <div className="change-grid-width-container">
                            <label>
                                Autoload Labels on Directory Select:
                            </label>
                            <input
                                type="checkbox"
                                name={"autoload_labels_on_dir_select"}
                                id={"autoload_labels_on_dir_select"}
                                onChange={() => changeAutoLoadOnDirSelect(this)}
                                checked={this.autoload_labels_on_dir_select}
                            ></input>
                        </div>
                        <button 
                            onClick={() => loadLabels(window, this, this.label_loadnames)} 
                            className="button">
                            Load Labels
                        </button>
                        <button 
                            onClick={() => saveLabels(window, this)} 
                            className="button">
                            Save Labels
                        </button>
                        <button 
                            onClick={() => clearAllLabels(this)} 
                            className="button">
                            Clear All Labels
                        </button>
                    </div>
                </div>
                <div id="grid-table" style={{display:"grid", gridTemplateColumns: "repeat(" + this.grid_width + ",1fr)" }}>
                    {this.image_names.map(image_name => (
                        // Use Fragment so React doesn't complain about not having a key,
                        // but we don't want to add a div to the DOM
                        <Fragment key={image_name}>
                            <GridImage
                                image={this.images[image_name]} 
                                image_name={image_name} 
                                classes={this.classes}
                                default_class={
                                    this.getClassFromImageName(image_name)
                                }
                                image_stack={
                                    getImageStackByName(this, image_name)
                                }
                            />
                        </Fragment>
                    ))}
                </div>
            </div>       
        )
    }

    componentDidMount() {
        // Add event listeners
        addAllEventListeners();

        // Ensure update runs once the page is fully loaded
        setInterval(() => {
            if (!this.update_success) {
                this.update_success = update_all_overlays(this);
                // Update filters (hidden class) on images
                this.changeGridFilter(this.filtered_class_name);
            }
        }, 1000)
    }

    componentWillUnmount() {
        // Remove event listeners
        removeAllEventListeners();
    }

    componentDidUpdate() {
        // Update overlays
        this.update_success = update_all_overlays(this);
        // Update filters (hidden class) on images
        this.changeGridFilter(this.filtered_class_name);
    }
}

export default Grid;