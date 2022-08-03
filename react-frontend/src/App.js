import { Component } from 'react';
import './css/App.css';
import Grid from "./components/Grid.js";
import Home from "./components/Home.js";
import {HashRouter, Link, Route, Routes} from "react-router-dom";

// Link keys to components
const COMPONENT_KEYS = {
  "grid": (props) => {return <Grid {...props}/>},
  "home": (props) => {return <Home {...props}/>},
}

class App extends Component {
  src = "";
  componentList = [];

  constructor(props) {
    super(props);

    
    // Initialize props
    this.QASM           = props.QASM; // QASM object
    this.config         = props.config;
    this.components     = this.config.components;
    this.component_keys = Object.keys(this.components);
    
    for (let component_key in this.components) {
      // Add QASM object to all component props
      let props = this.components[component_key]
      props.QASM = this.QASM;

      // Build component list
      this.componentList.push(
        COMPONENT_KEYS[component_key](props)
      )
    }
  }
  
  render() {
    return (
      <HashRouter>
      <div className="App">
        <div className="menu">
          {this.component_keys.map(component_key => (
            <Link 
              className="Link"
              to={component_key === "home" ? "/" : component_key}
              key={component_key}>
              <h2>{component_key}</h2>
            </Link>
          ))}
        </div>
        <Routes>
          {this.componentList.map((component, idx) => (
            <Route 
              path={this.component_keys[idx] === "home" ? "/" : this.component_keys[idx]} 
              element={component}
              key={idx}/>
          ))}
        </Routes>
      </div>
      </HashRouter>
    );
  }  
}

export default App;
