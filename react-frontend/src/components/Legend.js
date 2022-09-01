import { Component } from 'react';
// import { SVGInject } from "@iconfu/svg-inject";
import "../css/Legend.css";

class Legend extends Component {
    constructor(props) {
        super(props);

        // Initialize props
        this.classes = props.classes;
    }

    render() {
        return (
            <fieldset className="Legend" style={{gridTemplateColumns: `repeat(${this.classes.length}, 1fr)`}}>
                <legend>
                    Legend
                </legend>
                {this.classes.map((_class) => (
                    _class.svg_overlay === null
                        ? <p className="legend-overlay no-overlay">No Overlay</p>
                        : <img
                            src={_class.svg_overlay}
                            className={_class.class_name + " legend-overlay"} 
                            alt={_class.class_name + " legend"}
                            id={_class.class_name + "-legend"}>
                        </img>
                ))}
                {this.classes.map((_class) => (
                    <p className="legend-overlay-name">{_class.class_name}</p>
                ))}
            </fieldset>
        )
    }
}

export default Legend;