import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./webpages/WelcomePage";
import Troubleshooting from "./webpages/Troubleshooting";
import Deliverables from "webpages/Deliverables";
import Scoreboard from "webpages/Scoreboard";
import Dashboard from "./webpages/Dashboard";
import ShowSaved from "./custompages/ShowSaved";
import SavePlaylist from "./custompages/SavePlaylist";
import RemovePlaylist from "./custompages/RemovePlaylist";
import ArtistQuiz1 from "./quizpages/ArtistQuiz1"; //Taylor
import ArtistQuiz2 from "./quizpages/ArtistQuiz2"; //Queen
import ArtistQuiz3 from "quizpages/ArtistQuiz3";
import ErasQuiz1 from "./quizpages/ErasQuiz1"; //80s
import ErasQuiz2 from "quizpages/ErasQuiz2"; //70s
import ErasQuiz3 from "./quizpages/ErasQuiz3"; // Top Songs Global
import GenreQuiz1 from "quizpages/GenreQuiz1"; //Hip Hop 2024
import GenreQuiz2 from "quizpages/GenreQuiz2";
import GenreQuiz3 from "quizpages/GenreQuiz3";
import CustomQuiz from "quizpages/CustomQuiz";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/troubleshooting" element={<Troubleshooting />} />
        <Route path="/deliverables" element={<Deliverables />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/erasquiz1" element={<ErasQuiz1 />} />
        <Route path="/erasquiz2" element={<ErasQuiz2 />} />
        <Route path="/erasquiz3" element={<ErasQuiz3 />} />

        <Route path="/artistquiz1" element={<ArtistQuiz1 />} />
        <Route path="/artistquiz2" element={<ArtistQuiz2 />} />
        <Route path="/artistquiz3" element={<ArtistQuiz3 />} />

        <Route path="/genrequiz1" element={<GenreQuiz1 />} />
        <Route path="/genrequiz2" element={<GenreQuiz2 />} />
        <Route path="/genrequiz3" element={<GenreQuiz3 />} />

        <Route path="/showsaved" element={<ShowSaved />} />
        <Route path="/saveplaylist" element={<SavePlaylist />} />
        <Route path="/removeplaylist" element={<RemovePlaylist />} />

        <Route path="/scoreboard" element={<Scoreboard />} />

        <Route path="/custom-quiz/:playlistID" element={<CustomQuiz />} />
      </Routes>
    </Router>
  );
}

export default App;
