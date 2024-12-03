import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import Dashboard from "./Dashboard";
import Gamemode1 from "./Gamemode1"; // Import the Gamemode1 component'
import Gamemode2 from "./Gamemode2"; // Import Gamemode2

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gamemode1" element={<Gamemode1 />} />
        <Route path="/gamemode2" element={<Gamemode2 />} />
      </Routes>
    </Router>
  );
}

export default App;
