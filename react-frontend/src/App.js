import { Component } from 'react';
import './css/App.css';
import Grid from "./components/Grid.js";

class App extends Component {
  src = "";
  component_updater = 0;

  constructor(props) {
    super(props);
    this.state = {
      src: this.src
    };
}
  
  render() {
    return (
      <div className="App" key={this.component_updater}>
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
