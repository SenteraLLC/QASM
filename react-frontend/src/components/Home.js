import { Component } from 'react';
import icon from "../../public/icon.png";
const { components } = require("../../public/electron_constants.js");

class Home extends Component {
    constructor(props) {
        super(props);
        // Expose component in window
        window.COMPONENT = this;

        // Initialize props
        this.QASM = props.QASM;

        // Init state
        this.state = {
            show_config: false,
        };

        // Bind functions
        this.forwardToS3Browser = this.forwardToS3Browser.bind(this);
        this.toggleConfig = this.toggleConfig.bind(this);
    }

    toggleConfig() {
        // Toggle config json
        this.setState({
            show_config: !this.state.show_config,
        });
    }

    forwardToS3Browser() {
        // Hack to get to s3 browser using memory router
        if (window.S3_BROWSER_MODE !== undefined) {
            let link = document.getElementById(components.S3_BROWSER + "-link");
            link.click();
        }
    }

    componentDidMount() {
        // Runs on page load. The timeout makes it actually work for some reason
        setTimeout(() => {
            this.forwardToS3Browser();
        }, 1)
    }

    render() {
        return (
            <div className="Home">
                <h2>QASM Home</h2>
                <img src={icon} alt="icon"/>

                <div className="config">
                    <button
                        onClick={this.toggleConfig}
                        className="button">
                        { this.state.show_config ? "Hide Config" : "Show Config"}
                    </button>
                    <div className={this.state.show_config ? "config-json" : "hidden" }>
                        <p>Config JSON:</p>
                        <code style={{textAlign: "left"}}>
                            <pre>{JSON.stringify(this.QASM.og_config, null, 4)}</pre>
                        </code>
                    </div>
                </div>
            </div>
            
        )
    }
}

export default Home;