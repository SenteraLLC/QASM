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
  "grid":         (props) => {return <Grid {...props}/>},
  "home":         (props) => {return <Home {...props}/>},
  "binaryeditor": (props) => {return <BinaryEditors {...props}/>},
  "S3Browser":    (props) => {return <S3Browser {...props}/>},
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
    this.location       = window.location.href.split("/").slice(-1)[0] // Just page name

    // Create object to keep track of number of different components
    let component_counter = {};
    
    for (let component of this.components) {
      // Add QASM to each component
      component.QASM = this.QASM;

      // If the component is home the path will always be /
      if (component.component === "home") {
        component.path = "/"
      }
      // If its the first instance of a component the component_counter will be undefined for that components
      else if (component_counter[component.component] === undefined) {
        // Set the component_counter to 1 for that component
        component_counter[component.component] = 1;

        // Set the path to the component name
        component.path = component.component;
      }
      else {
        // Add 1 to the component_counter
        component_counter[component.component] += 1;

        // Set the path to be the component name + the number of that component so far.
        component.path = component.component + component_counter[component.component];
      }

      // Add an instance of the component to the componentList
      this.componentList.push(
        COMPONENT_KEYS[component.component](component)
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
    console.log(this.components)
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
                to={component.path}
                key={component.path}> 
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
              path={component.props.path}
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
