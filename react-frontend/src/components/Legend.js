import { Component } from 'react';
// import { SVGInject } from "@iconfu/svg-inject";

class Legend extends Component {
    constructor(props) {
        super(props);

        // Initialize props
        this.classes = props.classes;
    }

    render() {
        return (
            <table className="Legend" style={{borderSpacing: "2em"}}>
                <tbody>
                    <tr>
                        {this.classes.map(_class => (
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
                    </tr>
                    <tr>
                        {this.classes.map(_class => (
                            <td key={_class.class_name}>
                                <h2>{_class.class_name}</h2>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        )
    }
}

export default Legend;