import { Component } from "react";

class Binary extends Component {
    currently_hovered = false;

    constructor(props) {
        super(props);
        this.original_binary = props.original_binary;

        this.handleMouseIn = this.handleMouseIn.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    handleMouseIn(event) {
        this.currently_hovered = true;
    }

    handleMouseOut(event) {
        this.currently_hovered = false;
    }

    handleKeypress(event) {

        // Ignore all keypresses if the output binary is not being hovered
        if (!this.currently_hovered) return;

        switch(event.key) {
            case "=":
                console.log("=")
                break;
            case "-":
                console.log("-")
                break;
            default:
                console.log("other")
        }
    }

    render() {
        console.log(this.original_binary)
        let id;
        if (this.original_binary !== undefined) {
            id = this.original_binary.split("/").pop()
        }
        return (
            <div className="Binary" >
                <img 
                    src={this.original_binary} 
                    alt="Original Binary" 
                    id={this.original_binary !== undefined ? "original-" + id : null} 
                    className="input-binary"/>
                <img 
                    alt="Output Binary" 
                    id={this.original_binary !== undefined ? "output-" + id : null} 
                    className="output-binary" 
                    onMouseEnter={this.handleMouseIn} 
                    onMouseOut={this.handleMouseOut}/>
            </div>
        )
    }

    componentDidMount() {
        // document.addEventListener("mousemove", this.handleMousemove(this));
        document.addEventListener("keydown", this.handleKeypress.bind(this));
    }

    componentWillUnmount() {
        // document.removeEventListener("mousemove", this.handleMousemove(this));
        document.removeEventListener("keydown", this.handleKeypress.bind(this));
    }
}

export default Binary;