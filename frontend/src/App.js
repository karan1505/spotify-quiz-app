import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import Dashboard from "./Dashboard";
import Gamemode1 from "./Gamemode1"; // Import the Gamemode1 component
import Gamemode2 from "./Gamemode2"; // Import the Gamemode2 component
import SavePlaylist from "./SavePlaylist"; // Import CustomGamemode
import ShowSaved from "./ShowSaved";
import RemovePlaylist from "./RemovePlaylist";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gamemode1" element={<Gamemode1 />} />
        <Route path="/gamemode2" element={<Gamemode2 />} />
        <Route path="/showsaved" element={<ShowSaved />} />
        <Route path="/saveplaylist" element={<SavePlaylist />} />
        <Route path="/removeplaylist" element={<RemovePlaylist />} />
      </Routes>
    </Router>
  );
}

export default App;
