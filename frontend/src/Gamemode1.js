import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Gamemode1 = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameQuestion, setGameQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(7);
  const [hasAnswered, setHasAnswered] = useState(false);

  const playlistUrl =
    "https://open.spotify.com/playlist/37i9dQZEVXbNG2KDcFcKOF?si=Xz-CxFqjSSGUBmLK73iExg";

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(
          `https://quizzify-backend-5kpq.onrender.com/fetch_playlist`,
          {
            params: { playlist_url: playlistUrl },
            withCredentials: true,
          }
        );
        setPlaylist(response.data);
        generateGameQuestion(response.data.tracks);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, []);

  const generateGameQuestion = (tracks) => {
    if (questionIndex >= 5 || tracks.length < 4) return;

    const shuffledTracks = [...tracks].sort(() => 0.5 - Math.random());
    const correctAnswer = shuffledTracks[0];
    let options = shuffledTracks.slice(0, 4);

    if (!options.includes(correctAnswer)) {
      const randomIndex = Math.floor(Math.random() * options.length);
      options[randomIndex] = correctAnswer;
    }

    options = options.sort(() => 0.5 - Math.random());
    setGameQuestion({ correctAnswer, options });
    setHasAnswered(false);
    setCountdown(7);
  };

  const handleOptionClick = (selectedTrack) => {
    if (!gameQuestion || hasAnswered) return;

    if (selectedTrack === gameQuestion.correctAnswer) {
      setScore(score + 10);
    } else {
      setScore(score - 10);
    }

    setHasAnswered(true);
  };

  useEffect(() => {
    let countdownInterval;

    if (hasAnswered) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) return prev - 1;

          // Move to the next question and reset states
          setQuestionIndex((prevIndex) => prevIndex + 1);
          generateGameQuestion(playlist.tracks);
          clearInterval(countdownInterval);
          return 7;
        });
      }, 1000);
    }

    return () => clearInterval(countdownInterval);
  }, [hasAnswered, questionIndex, playlist]);

  return (
    <Container maxWidth="md">
      <Box textAlign="center" mt={5} mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Guess the Song Quiz!
        </Typography>
        <Typography variant="h6">Question {questionIndex + 1}</Typography>
        <Typography variant="h6">Score: {score}</Typography>
        {hasAnswered && (
          <Typography variant="h6">
            Next question in: {countdown} seconds
          </Typography>
        )}
      </Box>
      {gameQuestion && (
        <Box mb={3} textAlign="center">
          {/* <Typography variant="h6">Guess the Song!</Typography> */}
          <Typography variant="subtitle1">
            Listen to the preview and select one of the options below
          </Typography>
        </Box>
      )}
      <Box mb={3}>
        {loading ? (
          <CircularProgress />
        ) : playlist ? (
          <Card sx={{ mb: 3, p: 2 }}>
            <CardContent>
              {/* <Typography variant="h5" component="h2" gutterBottom>
                {playlist.playlist_name}
              </Typography> */}
              {gameQuestion?.correctAnswer.preview_url && (
                <Box mt={2}>
                  <audio
                    controls
                    src={gameQuestion.correctAnswer.preview_url}
                    style={{ width: "100%" }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : (
          <Typography variant="body1" color="error">
            Error loading playlist.
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {gameQuestion?.options.map((track, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              onClick={() => handleOptionClick(track)}
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
                borderRadius: "10px",
                boxShadow: 3,
              }}
            >
              <CardMedia
                component="img"
                image={track.album_cover || "https://via.placeholder.com/640"}
                alt={track.name}
                sx={{
                  height: 140,
                  objectFit: "cover",
                  borderRadius: "10px 10px 0 0",
                }}
              />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: track.name.length > 20 ? "0.8rem" : "1rem",
                  }}
                >
                  {track.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {track.artist}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={5}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Gamemode1;
