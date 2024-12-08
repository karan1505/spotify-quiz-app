import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./webpages/WelcomePage";
import Troubleshooting from "./webpages/Troubleshooting";
import Deliverables from "webpages/Deliverables";
import Dashboard from "./webpages/Dashboard";
import ShowSaved from "./custompages/ShowSaved";
import SavePlaylist from "./custompages/SavePlaylist";
import RemovePlaylist from "./custompages/RemovePlaylist";
import Quiz1 from "./quizpages/Quiz1"; // Top Songs Global
import ArtistQuiz1 from "./quizpages/ArtistQuiz1"; //Taylor
import ArtistQuiz2 from "./quizpages/ArtistQuiz2"; //Queen
import ErasQuiz1 from "./quizpages/ErasQuiz1"; //80s
import ErasQuiz2 from "quizpages/ErasQuiz2"; //70s
import GenreQuiz1 from "quizpages/GenreQuiz1"; //Hip Hop 2024
import GenreQuiz2 from "quizpages/GenreQuiz2";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/showsaved" element={<ShowSaved />} />
        <Route path="/saveplaylist" element={<SavePlaylist />} />
        <Route path="/removeplaylist" element={<RemovePlaylist />} />
        <Route path="/quiz1" element={<Quiz1 />} />
        <Route path="/genrequiz1" element={<GenreQuiz1 />} />
        <Route path="/genrequiz2" element={<GenreQuiz2 />} />
        <Route path="/artistquiz1" element={<ArtistQuiz1 />} />
        <Route path="/artistquiz2" element={<ArtistQuiz2 />} />
        <Route path="/erasquiz1" element={<ErasQuiz1 />} />
        <Route path="/erasquiz2" element={<ErasQuiz2 />} />
        <Route path="/troubleshooting" element={<Troubleshooting />} />
        <Route path="/deliverables" element={<Deliverables />} />
      </Routes>
    </Router>
  );
}

export default App;
