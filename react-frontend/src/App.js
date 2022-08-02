import { Component } from 'react';
import './css/App.css';
import Grid from "./components/Grid.js";

// Link keys to components
const COMPONENT_KEYS = {
  "grid": (props) => {return <Grid {...props}/>}
}


class App extends Component {
  src = "";
  component_updater = 0;
  componentList = [];

  constructor(props) {
    super(props);

    
    // Initialize props
    this.QASM       = props.QASM; // QASM object
    this.config     = props.config;
    this.components = this.config.components;
    
    
    for (let component_key in this.components) {
      // Add QASM object & key to all component props
      let props = this.components[component_key]
      props.QASM = this.QASM;
      props.key = component_key;

      // Build component list
      this.componentList.push(
        COMPONENT_KEYS[component_key](props)
      )
    }
  }
  
  render() {
    return (
      <div className="App" key={this.component_updater}>
        {this.componentList}
      </div>
    );
  }  
}

export default App;
