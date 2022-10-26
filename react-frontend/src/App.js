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
    
    for (let component_idx in this.components) {
      // Add QASM object to all component props
      let props = this.components[component_idx]
      props.QASM = this.QASM;

      // Build component list
      this.componentList.push(
        COMPONENT_KEYS[this.components[component_idx].component](props)
      )
    }

    // Create unique keys for each component
    this.createComponentKeys(this.components)

    // Setup S3 browser
    this.s3props = {
      "QASM": this.QASM,
    }

    // Bind functions
    this.createComponentKeys = this.createComponentKeys.bind(this);
  }

  /**
   * Loops through each component in the component list. It keeps track of how many of each component there is.
   * If its the first component of its type, then its key will be the same name as its component. Otherwise, its
   * key is the name of its component plus which number component it is.
   * e.g. [{component: home, key: home}, {component: grid, key: grid}, {component: grid, key: grid2}]
   * 
   * @param {Object[]} component_list An array of component config objects
   */
  createComponentKeys(component_list) {
    // Define an object to count how many types of an object are in component_list
    let component_counter = {}

    for (let component of component_list) {
      if (component_counter[component.component] === undefined) {
        component_counter[component.component] = 1;
        component.key = component.component;
      }
      else {
        component_counter[component.component] += 1;
        component.key = component.component + component_counter[component.component];
      }
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
                  : component.key
                }
                key={component.key !== undefined ? component.key : component.component /* component.key should be provided whenever duplicate components are added to the config */}> 
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
                : this.components[idx].component + this.components[idx].key
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
