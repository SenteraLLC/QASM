import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { QASM } from "./QASM/QASM.js";
import config from "../config.json";
import package_json from "../package.json";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App 
      QASM={await QASM.create(config, package_json).init()}
      config={config}
    />
  </>
);

// Clear local storage so that we can accurately 
// track event listener status and other local storage data
localStorage.clear();

reportWebVitals();
