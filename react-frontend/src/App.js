import './css/App.css';
import Grid from "./components/Grid.js";
import x_overlay from "./icons/x.svg";
// const { ipcRenderer } = window.require("electron");
// const ipcRenderer = window.electron.ipcRenderer;

async function openFile() {
  console.log(await window.electron.openFile());
}

function App() {
  return (
    <div className="App">
        <button onClick={openFile}>File load test</button>
        <Grid 
          src={"../data/images"} 
          // labels={"../data/labels"}
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

export default App;
