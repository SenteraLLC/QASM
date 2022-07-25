import './css/App.css';
import Grid from "./components/Grid.js";

function App() {
  return (
    <div className="App">
        <Grid src={"../data/images"} grid_width={2} classes = {["plant", "rogue"]}/>
    </div>
  );
}

export default App;
