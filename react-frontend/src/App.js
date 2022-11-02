import { Component } from 'react';
import './css/App.css';
import Grid from "./components/Grid.js";
import Home from "./components/Home.js";
import BinaryEditors from "./components/BinaryEditors.js";
import S3Browser from "./components/S3Browser.js";
import icon from "../public/icon.png";
import {HashRouter, Link, Route, Routes} from "react-router-dom";

// Link keys to components
const COMPONENT_KEYS = {
  "grid":          (props) => {return <Grid {...props}/>},
  "home":          (props) => {return <Home {...props}/>},
  "binaryeditor":  (props) => {return <BinaryEditors {...props}/>},
  "S3Browser":     (props) => {return <S3Browser {...props}/>},
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
    // this.component_keys = Object.keys(this.components);
    this.location       = window.location.href.split("/").slice(-1)[0] // Just page name

    // Create object to keep track of number of diffrent components
    let component_counter = {};
    
    for (let component_idx in this.components) {
      // Grab the props passed to each component
      let props = this.components[component_idx]

      // Add QASM object to all component props
      props.QASM = this.QASM;

      if (component_counter[props.component] === undefined) {
        // Set the component counter for this component to 1
        component_counter[props.component] = 1;

        // Then set the key
        props.component_key = props.component;
      }
      else {
        // If the component counter for this component is already a number, then add 1 to it
        component_counter[props.component] += 1;

        // This isn't the first component of this type, so its id will be the component name plus which number component it is
        props.component_key = props.component + component_counter[props.component];
      }

      console.log(props)
      // Build component list
      this.componentList.push(
        COMPONENT_KEYS[props.component](props)
      )
    }

    for (let component of this.components) {
      console.log(component, "Components still in constructor")
    }

    // Setup S3 browser
    this.s3props = {
      "QASM": this.QASM,
    }
  }
  
  render() {
    return (
      <HashRouter>
      <div className="App">
        { this.location !== "s3Browser" &&
          // Disable navbar when in the s3Browser
          <div className="menu">
            <a href='/' id="menu-logo">
              <img src={icon} alt="Logo" />
            </a>
            {this.components.map(component => (
              <Link 
                className="Link"
                to={component.component === "home" 
                  ? "/" 
                  : component.component_key
                }
                key={component.component_key}> 
                <h2>
                  {component.display_name === undefined 
                  ? component.component
                  : component.display_name}
                </h2>
              </Link>
            ))}
          </div>
        }
        <Routes>
          {this.componentList.map((component, idx) => (
            <Route 
              path={this.components[idx].component === "home"
                ? "/"
                : this.components[idx].component.component_key
              }
              element={component}
              key={idx}/>
          ))}
          <Route 
            path="S3Browser" 
            element={COMPONENT_KEYS["S3Browser"](this.s3props)}
            key="S3Browser"/>
        </Routes>
      </div>
      </HashRouter>
    );
  }  
}

export default App;
