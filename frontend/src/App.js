import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import Dashboard from "./Dashboard";
import Quiz1 from "./quizpages/Quiz1"; // Import the Gamemode1 component
import Gamemode2 from "./Gamemode2"; // Import the Gamemode2 component
import SavePlaylist from "./SavePlaylist"; // Import CustomGamemode
import ShowSaved from "./ShowSaved";
import RemovePlaylist from "./RemovePlaylist";
import Quiz3 from "./quizpages/Quiz3";
import ArtistQuiz1 from "./quizpages/ArtistQuiz1";
import Quiz2 from "./quizpages/Quiz2";
import ErasQuiz1 from "./quizpages/ErasQuiz1";
import ErasQuiz2 from "quizpages/ErasQuiz2";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gamemode2" element={<Gamemode2 />} />
        <Route path="/showsaved" element={<ShowSaved />} />
        <Route path="/saveplaylist" element={<SavePlaylist />} />
        <Route path="/removeplaylist" element={<RemovePlaylist />} />
        <Route path="/quiz1" element={<Quiz1 />} />
        <Route path="/quiz2" element={<Quiz2 />} />
        <Route path="/quiz3" element={<Quiz3 />} />
        <Route path="/artistquiz1" element={<ArtistQuiz1 />} />
        <Route path="/erasquiz1" element={<ErasQuiz1 />} />
        <Route path="/erasquiz2" element={<ErasQuiz2 />} />
      </Routes>
    </Router>
  );
}

export default App;
