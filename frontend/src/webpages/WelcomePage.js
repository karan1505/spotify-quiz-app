import React from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import config from "../config"; // Import the config file
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    document.cookie =
      "access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;SameSite=None;HttpOnly";
    sessionStorage.clear();
    window.location.href = `${config.BASE_URL}/login`;
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        backgroundImage: `url(https://images.unsplash.com/photo-1476136236990-838240be4859?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#ffffff",
        py: 5,
      }}
    >
      {/* Header Section */}
      <Container maxWidth="lg" sx={{ textAlign: "center", mb: 5 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          Quizzify
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: "#e2e8f0",
            textShadow: "0px 1px 3px rgba(0, 0, 0, 0.5)",
            maxWidth: "600px",
            mx: "auto",
            mb: 3,
          }}
        >
          Test yourself with curated & user generated quizzes based on Spotify
          playlists, challenge yourself and your friends to see how well you
          know music!
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            onClick={() => navigate("/troubleshooting")}
            variant="contained"
            sx={{
              bgcolor: "#2b6cb0",
              color: "#ffffff",
              "&:hover": {
                bgcolor: "#3182ce",
              },
              px: 4,
              py: 1.5,
              borderRadius: "20px",
              fontWeight: 600,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            Instructions and Troubleshooting
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#3182ce",
              color: "#ffffff",
              "&:hover": {
                bgcolor: "#2b6cb0",
              },
              px: 4,
              py: 1.5,
              borderRadius: "20px",
              fontWeight: 600,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.3)",
            }}
            onClick={handleSignIn}
          >
            Sign In
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#3182ce",
              color: "#ffffff",
              "&:hover": {
                bgcolor: "#2d3748",
              },
              px: 4,
              py: 1.5,
              borderRadius: "20px",
              fontWeight: 600,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.3)",
            }}
            onClick={() => navigate("/deliverables")}
          >
            Deliverables
          </Button>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "#ffffff",
            textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
            mb: 3,
          }}
        >
          Explore Our Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* Features Cards */}
          {[
            {
              title: "Popular Playlists",
              description: "Challenges based on popular playlists on Spotify",
              image:
                "https://wallpapersok.com/images/thumbnail/spotify-playlist-music-aesthetic-plm48h2zvnjcebnf.jpg",
            },
            {
              title: "Artists",
              description: "Curated Artist Gamemodes",
              image:
                "https://www.rollingstone.com/wp-content/uploads/2019/01/26-those-shoes-eagles-songs-1979.jpg?w=800",
            },
            {
              title: "Genres",
              description: "Genre Gamemodes, with Rock, Hip-Hop and more",
              image:
                "https://americanrootsmusicfall2016.wordpress.com/wp-content/uploads/2016/12/indie-movie-vintage-favim-com-302025.jpg?w=500",
            },
            {
              title: "Eras",
              description: "Relive your favorite tracks from past decades",
              image:
                "https://i.ebayimg.com/images/g/NpsAAOSwyxVgowtY/s-l1200.jpg",
            },
            {
              title: "Custom Gamemodes",
              description: "Gamemodes based on playlists from your library",
              image:
                "https://static.displate.com/857x1200/displate/2024-01-19/c8b6d06d8b9d07814f37aa8368c8838c_7bf29cdd628885c0bbfc773d015133b0.jpg",
            },
            {
              title: "Stat Tracking",
              description: "Compare your music stats with your friends.",
              image:
                "https://ayalabulldogtimes.org/wp-content/uploads/2023/05/Untitled-design-4-900x900.png",
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  cursor: "pointer",
                  bgcolor: "#ffffff",
                  boxShadow: 3,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                // onClick={() => { /* Add your onClick functionality here */ }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={feature.image}
                  alt={feature.title}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4a5568" }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ py: 5, mt: 5, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              mb: 2,
              textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
            }}
          >
            About Us
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#e2e8f0",
              maxWidth: "600px",
              mx: "auto",
              textShadow: "0px 1px 3px rgba(0, 0, 0, 0.5)",
            }}
          >
            Quizzify is created as a final project for the course *Secure Web
            Application Development* at UIC for Fall 2024. Challenge yourself
            and explore your favorite songs and artists with fun and engaging
            game modes.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;
