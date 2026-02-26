import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./webpages/WelcomePage";
import Troubleshooting from "./webpages/Troubleshooting";
import Scoreboard from "webpages/Scoreboard";
import Dashboard from "./webpages/Dashboard";
import ShowSaved from "./custompages/ShowSaved";
import SavePlaylist from "./custompages/SavePlaylist";
import RemovePlaylist from "./custompages/RemovePlaylist";
import Quiz from "quizpages/Quiz";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/troubleshooting" element={<Troubleshooting />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/quiz/:quizId" element={<Quiz />} />

        <Route path="/showsaved" element={<ShowSaved />} />
        <Route path="/saveplaylist" element={<SavePlaylist />} />
        <Route path="/removeplaylist" element={<RemovePlaylist />} />

        <Route path="/scoreboard" element={<Scoreboard />} />
      </Routes>
    </Router>
  );
}

export default App;
