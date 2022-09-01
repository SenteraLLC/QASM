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
                {this.classes.map(_class => (
                    <div className="legend-element">
                        {_class.svg_overlay === null 
                            ? <p className="legend-overlay">No Overlay</p>
                            : <img
                                src={_class.svg_overlay}
                                className={_class.class_name + " legend-overlay"} 
                                alt={_class.class_name + " legend"}
                                id={_class.class_name + "-legend"}>
                            </img>
                        }
                        <p key={_class.class_name} className="legend-overlay-name">
                            {_class.class_name}
                        </p>
                    </div>
                ))}

                        {/* {this.classes.map(_class => (
                            <td 
                                key={_class.class_name}
                                style={{ height: "10em", width:"10em"}}
                            >
                                {_class.svg_overlay === null 
                                    ? <p>No Overlay</p>
                                    : <img
                                        src={_class.svg_overlay}
                                        className={_class.class_name} 
                                        alt={_class.class_name + " legend"}
                                        id={_class.class_name + "-legend"}
                                        style={{height: "100%", width:"100%"}}>
                                    </img>
                                }
                            </td>
                        ))}
                    
                    
                        {this.classes.map(_class => (
                            <td key={_class.class_name}>
                                <h2>{_class.class_name}</h2>
                            </td>
                        ))} */}
                    
            </fieldset>
        )
    }
}

export default Legend;