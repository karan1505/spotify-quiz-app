import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import WelcomePage from "./webpages/WelcomePage";
import Troubleshooting from "./webpages/Troubleshooting";
import NotFound from "./webpages/NotFound";
import Scoreboard from "./webpages/Scoreboard";
import Dashboard from "./webpages/Dashboard";
import ShowSaved from "./custompages/ShowSaved";
import SavePlaylist from "./custompages/SavePlaylist";
import RemovePlaylist from "./custompages/RemovePlaylist";
import Quiz from "./quizpages/Quiz";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><WelcomePage /></PageTransition>} />
        <Route path="/troubleshooting" element={<PageTransition><Troubleshooting /></PageTransition>} />

        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/quiz/:quizId" element={<ProtectedRoute><PageTransition><Quiz /></PageTransition></ProtectedRoute>} />
        <Route path="/showsaved" element={<ProtectedRoute><PageTransition><ShowSaved /></PageTransition></ProtectedRoute>} />
        <Route path="/saveplaylist" element={<ProtectedRoute><PageTransition><SavePlaylist /></PageTransition></ProtectedRoute>} />
        <Route path="/removeplaylist" element={<ProtectedRoute><PageTransition><RemovePlaylist /></PageTransition></ProtectedRoute>} />
        <Route path="/scoreboard" element={<ProtectedRoute><PageTransition><Scoreboard /></PageTransition></ProtectedRoute>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AnimatedRoutes />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
