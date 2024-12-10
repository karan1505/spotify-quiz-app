import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import config from "../config";
const ShowSaved = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.defaults.withCredentials = true;

    const fetchSavedPlaylists = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/saved_playlists`);
        setPlaylists(response.data.saved_playlists); // Adjust to match the endpoint response structure
      } catch (error) {
        console.error("Failed to fetch saved playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPlaylists();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!playlists.length) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6" color="textSecondary">
          No saved playlists found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      sx={{
        backgroundImage: `url(https://images.pexels.com/photos/3721941/pexels-photo-3721941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        py: 5,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            color: "#fff",
            textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)",
            fontWeight: 500,
            mb: 3,
          }}
        >
          Your Saved Playlists
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {playlists.map((playlist) => (
            <Grid item xs={12} sm={6} md={4} key={playlist.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  bgcolor: "#ffffff",
                  boxShadow: 3,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                onClick={() => navigate(`/custom-quiz/${playlist.id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    playlist.images?.[0]?.url ||
                    "https://via.placeholder.com/200x200?text=No+Image"
                  }
                  alt={playlist.name}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {playlist.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4a5568" }}>
                    {playlist.tracks.total} Tracks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ShowSaved;
