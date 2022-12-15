import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { QASM } from "./QASM/QASM.js";
import config from "./config.json";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App 
      QASM={await QASM.create(config).init()}
      config={config} // TODO: also use cli config 
    />
  </>
);

reportWebVitals();
