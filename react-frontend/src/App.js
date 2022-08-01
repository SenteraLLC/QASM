import { Component } from 'react';
import x_overlay from "./icons/x.svg";
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
          classes={[
            {"class_name": "plant", "svg_overlay": null}, 
            {"class_name": "rouge", "svg_overlay": x_overlay},
            {"class_name": "Trevor_plant", "svg_overlay": x_overlay, "opacity": 0.2}
          ]}
        />
      </div>
    );
  }  
}

export default App;
