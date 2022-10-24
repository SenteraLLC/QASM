import { Component } from 'react';
import icon from "../../public/icon.png";

class Home extends Component {
    constructor(props) {
        super(props);

        // Initialize props
        this.QASM = props.QASM;
    }

    render() {
        return (
            <div className="Home">
                <h2>QASM Home</h2>
                <img src={icon} alt="icon"/>
            </div>
        )
    }
}

export default Home;