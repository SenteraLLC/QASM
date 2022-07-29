import { Component } from 'react';
import './css/App.css';
import Grid from "./components/Grid.js";
// import { call_backend } from "./QASM/utils.js";
const { call_backend } =  require("./QASM/utils.js");
const { function_names } = require("./../public/electron_constants.js");

class App extends Component {
  src = "";
  component_updater = 0;

  constructor(props) {
    super(props);
    this.state = {
      src: this.src
    };

    // Bind functions
    this.selectImageDir = this.selectImageDir.bind(this);
}

  async selectImageDir() {
    let dir_path = await call_backend(window, function_names.OPEN_DIR);
    this.src = dir_path;
    this.setState({
      src: this.src
    });
    this.component_updater++;
  }
  
  render() {
    return (
      <div className="App" key={this.component_updater}>
        <button 
          onClick={this.selectImageDir} 
          style={{"marginBottom":"16px"}}>
          Select Directory
        </button>
        <Grid 
          src={this.src} 
          grid_width={2} 
          classes={["plant", "rogue"]}
          css_by_class={
            {
              plant: {
                padding: "10px",
              },
              rogue: {
                overflow: "hidden",
                position: "relative",
                // content: "",
                backgroundSize: "cover",
                // display: "block",
                // width: "80%",
                // height: "15%",
                // // "-webkit-transform": "rotate(-45deg)",
                // // transform: "rotate(-45deg)",
                // left: 0,
                // right: 0,
                // top: 0,
                // bottom: 0,
                padding: "10px",
                zIndex: 1,
              }
            }
          }
        />
      </div>
    );
  }  
}

export default App;
