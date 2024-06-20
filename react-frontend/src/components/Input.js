import { Component } from "react";
import "../css/Input.css";
const { function_names, } = require("../../public/electron_constants.js");

class Input extends Component {

    constructor(props){
        super(props);

        this.QASM           = props.QASM;
        this.display_string = props.display_string;
        this.inputs         = props.inputs; // Array of input objects, {name: string, type: string, default: string}
        this.on_submit      = props.on_submit; // Logic to call when form is submitted

        // Bind functions
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    /**
     * Parse the form data and trigger the on_submit function
     * 
     * @param {object} e Event object 
     */
    handleFormSubmit(e) {
        e.preventDefault();
        
        // Create a list of objects containing the input names and values
        let input_values = [];
        let input_fields = e.target.getElementsByTagName("input");
        for (let i = 0; i < input_fields.length; i++) {
            input_values.push({
                name: input_fields[i].previousSibling.innerHTML,
                value: input_fields[i].value
            });
        }
        console.log(input_values);

        // Call the on_submit function
        const on_submit_keys = Object.keys(this.on_submit);
        const required_aws_lambda_keys = ["function_arn", "role_arn"];
        let data;
        switch (this.on_submit.type) {
            case "aws_lambda":
                // Check if all required keys are present
                for (let required_key of required_aws_lambda_keys) {
                    if (!on_submit_keys.includes(required_key)) {
                        console.error("Missing required key for on_submit type aws_lambda: ", required_key);
                        return;
                    }
                }
                // Create the data object
                data = {
                    function_arn: this.on_submit.function_arn,
                    role_arn: this.on_submit.role_arn,
                    params: input_values
                };
                // Trigger the lambda
                this.QASM.call_backend(
                    window, 
                    function_names.TRIGGER_INPUT_LAMBDA, 
                    data
                );
                break;
            default:
                console.error("Invalid on_submit type: ", this.on_submit.type);
        }
    }

    render() {
        return (
            <div className="Input">
                <div className="input-title">
                    { this.display_string }
                </div>
                <form
                    onSubmit={(e) => {this.handleFormSubmit(e)}}
                >
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
                </form>
            </div>
        )
    }
}

export default Input;