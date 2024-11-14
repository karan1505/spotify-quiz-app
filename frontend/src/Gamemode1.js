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

  const playlistUrl =
    "https://open.spotify.com/playlist/37i9dQZEVXbNG2KDcFcKOF?si=Xz-CxFqjSSGUBmLK73iExg";

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/fetch_playlist`,
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
    if (tracks.length < 4) return;

    const shuffledTracks = [...tracks].sort(() => 0.5 - Math.random());
    const correctAnswer = shuffledTracks[0];
    const options = shuffledTracks.slice(0, 4);
    setGameQuestion({ correctAnswer, options });
  };

  return (
    <Container maxWidth="md">
      <Box textAlign="center" mt={5} mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Top Songs of the Week Quiz!
        </Typography>
      </Box>
      {gameQuestion && (
        <Box mb={3} textAlign="center">
          <Typography variant="h6">Guess the Song!</Typography>
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
              <Typography variant="h5" component="h2" gutterBottom>
                {playlist.playlist_name}
              </Typography>
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
          <Grid item xs={12} sm={6} key={index}>
            <Card
              onClick={() => console.log(`Clicked on: ${track.name}`)}
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={track.album_art || "https://via.placeholder.com/140"}
                alt={track.name}
              />
              <CardContent>
                <Typography variant="h6">{track.name}</Typography>
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
