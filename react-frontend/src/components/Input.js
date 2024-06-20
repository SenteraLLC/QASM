import { Component } from "react";
import "../css/Input.css";

class Input extends Component {

    constructor(props){
        super(props);

        this.QASM           = props.QASM;
        this.display_string = props.display_string;
        this.inputs         = props.inputs; // Array of input objects, {name: string, type: string, default: string}

        // Bind functions
    }



    render() {
        return (
            <div className="Input">
                <div className="input-title">
                    { this.display_string }
                </div>
                <div className="input-fields-container">
                    {this.inputs.map((input, index) => {
                        return (
                            <div key={index} className="input-field">
                                <label>{input.name}</label>
                                <input type={input.type} defaultValue={input.default || ""}></input>
                            </div>
                        )
                    })}
                </div>
                <div className="input-submit">
                    <button>Submit</button>
                </div>
            </div>
        )
    }
}

export default Input;