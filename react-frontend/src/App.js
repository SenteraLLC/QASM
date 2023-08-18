import { Component } from 'react';
import './css/App.css';

import Grid from "./components/Grid.js";
import MultiClassGrid from './components/MultiClassGrid';
import Home from "./components/Home.js";
import BinaryEditors from "./components/BinaryEditors.js";
import S3Browser from "./components/S3Browser.js";
import ImageLabeler from './components/ImageLabeler';

import icon from "../public/icon.png";
import {Link, MemoryRouter, Route, Routes} from "react-router-dom";

const { components } = require("../public/electron_constants.js");

// Link keys to components
const COMPONENT_KEYS = {
  [components.GRID]:             (props) => {return <Grid {...props}/>},
  [components.MULTI_CLASS_GRID]: (props) => {return <MultiClassGrid {...props}/>},
  [components.HOME]:             (props) => {return <Home {...props}/>},
  [components.BINARY_EDITOR]:    (props) => {return <BinaryEditors {...props}/>},
  [components.S3_BROWSER]:       (props) => {return <S3Browser {...props}/>},
  [components.IMAGE_LABELER]:    (props) => {return <ImageLabeler {...props}/>},
}

class App extends Component {
  src = "";
  componentList = [];
  home_component_present = false;
  constructor(props) {
    super(props);

    
    // Initialize props
    this.QASM           = props.QASM; // QASM object
    this.config         = props.config;
    this.components     = this.config.components;

    // Bind functions
    this.logoOnClick = this.logoOnClick.bind(this);

    // Create object to keep track of number of different components
    let component_counter = {};
    
    for (let component of this.components) {
      // Add QASM to each component
      component.QASM = this.QASM;

      // If the component is home the path will always be /
      if (component.component === "home") {
        component.path = "/";
        this.home_component_present = true;
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

        // As far as I know component.key isn't used anywhere.
        // I have no idea why, but it breaks without this line 
        component.key = component.component + component_counter[component.component];
      }

      // Add an instance of the component to the componentList
      this.componentList.push(
        COMPONENT_KEYS[component.component](component)
      )
    }

    // Setup S3 browser
    this.s3props = {
      "QASM": this.QASM,
    }
  }

  logoOnClick() {
    // Click on the home button to go to the home page
    let link = document.getElementById("home-link");
    link.click();
  }

  
  render() {
    return (
      <MemoryRouter>
      <div className="App">
        <div className={window.S3_BROWSER_MODE === undefined ? "menu": "hidden"}> 
          <img id="menu-logo" src={icon} alt="Logo" onClick={this.logoOnClick}/>
          <div className="link-holder" >
            {this.components.map(component => (
              <Link 
                className="Link"
                id={component.component + "-link"}
                to={component.path}
                key={component.path}> 
                <h2>
                  {component.display_name === undefined 
                  ? component.component
                  : component.display_name}
                </h2>
              </Link>
            ))}
            {/* When the home component is not specified by the user, 
            still create the link so that the icon can be pressed to reach it.*/}
            {!this.home_component_present &&
              <Link 
                id="home-link"
                className=" Link hidden"
                to="/"
                key="home"/>
            }
            <Link 
                id="s3browser-link"
                className=" Link hidden"
                to="S3Browser"
                key="S3Browser"/>
          </div>
        </div>
        <Routes>
          {this.componentList.map((component, idx) => (
            <Route 
              path={component.props.path}
              element={component}
              key={idx}/>
          ))}
          {/* When the home component is not specified by the user, 
          still create the route so that the S3 Browser works */}
          {!this.home_component_present &&
            <Route
              path="/"
              element={COMPONENT_KEYS["home"]({QASM: this.QASM})}
              key="home"/>
          }
          <Route 
            path="S3Browser" 
            element={COMPONENT_KEYS["S3Browser"](this.s3props)}
            key="S3Browser"/>
        </Routes>
      </div>
      </MemoryRouter>
    );
  }
}

export default App;
