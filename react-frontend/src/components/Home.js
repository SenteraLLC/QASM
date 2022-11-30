import { Component} from 'react';
import icon from "../../public/icon.png";

class Home extends Component {
    constructor(props) {
        super(props);

        // Initialize props
        this.QASM = props.QASM;

        // Bind functions
        this.forwardToS3Browser = this.forwardToS3Browser.bind(this);
    }

    forwardToS3Browser() {
        // Hack to get to s3 browser using memory router
        if (window.S3_BROWSER_MODE !== undefined) {
            let link = document.getElementById("s3browser-link");
            link.click();
        }
    }

    componentDidMount() {
        // Runs on page load. The timeout makes it actually work for some reason
        setTimeout(() => {
            this.forwardToS3Browser();
        }, 0)
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