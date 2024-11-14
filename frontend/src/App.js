import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import Dashboard from "./Dashboard";
import Gamemode1 from "./Gamemode1"; // Import the Gamemode1 component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gamemode1" element={<Gamemode1 />} />{" "}
        {/* Add the route for gamemode1 */}
      </Routes>
    </Router>
  );
}

export default App;
