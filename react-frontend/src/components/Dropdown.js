import { Component } from "react";
import "../css/Dropdown.css";

class Dropdown extends Component {

    constructor(props) {
        super(props);

        this.items        = props.items;
        this.callback     = props.callback;
        this.style        = props.style;
        this.display_text = props.display_text;

        if (this.display_text === undefined || null) {
            this.display_text = "▶"
        }
    }


    render() {
        return (
            <div className="Dropdown">
                <button className="toggle-display">
                    {this.display_text}
                </button>
                <div className="dropdown-content">

                </div>
            </div>
        )
    }
}

export default Dropdown