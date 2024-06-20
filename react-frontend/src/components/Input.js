import { Component } from "react";
import "../css/Input.css";

class Input extends Component {

    constructor(props){
        super(props);

        this.QASM           = props.QASM;
        this.display_string = props.display_string;
        this.inputs         = props.inputs;

        // Bind functions
    }



    render() {
        return (
            <div className="Input">
                { this.display_string }
            </div>
        )
    }
}

export default Input;