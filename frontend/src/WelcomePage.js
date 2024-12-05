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
import Link from "@mui/material/Link";
import config from "./config"; // Import the config file

const WelcomePage = () => {
  const handleSignIn = () => {
    // Clear the cookie with the same attributes
    document.cookie =
      "access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;SameSite=None;HttpOnly";
    // Clear session storage
    sessionStorage.clear();
    // Redirect to login page
    window.location.href = `${config.BASE_URL}/login`;
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        backgroundColor: "#f1f5f9", // Softer background color
        color: "#2d3748", // Improved text contrast
      }}
    >
      {/* Header Section */}
      <Container maxWidth="lg" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Quizzify
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            color: "#4a5568",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          Test your music knowledge with personalized quizzes based on your
          Spotify history! Challenge yourself and have fun exploring your love
          for music.
        </Typography>
        <Typography sx={{ fontStyle: "italic", color: "#718096" }}>
          Note: Some features may require Spotify Premium.
        </Typography>
        <Box mt={3}>
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
            }}
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </Box>
      </Container>

      {/* Gamemode Section */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 600,
            borderBottom: "2px solid #4a5568",
            display: "inline-block",
            mb: 4,
          }}
        >
          Explore Our Gamemodes
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* Gamemode 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                bgcolor: "#ffffff",
                boxShadow: 3,
                "&:hover": { transform: "scale(1.05)" },
                transition: "0.3s",
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Top Songs Gamemode"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top Songs of the Week Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Test your music knowledge on Spotify's global top songs of the
                  week. Can you guess them all?
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Gamemode 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                bgcolor: "#ffffff",
                boxShadow: 3,
                "&:hover": { transform: "scale(1.05)" },
                transition: "0.3s",
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Custom Gamemode"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Custom Gamemode
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Create your own quiz by selecting songs from your Spotify
                  playlists. Challenge your friends with your favorite tracks!
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Gamemode 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                bgcolor: "#ffffff",
                boxShadow: 3,
                "&:hover": { transform: "scale(1.05)" },
                transition: "0.3s",
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://images.pexels.com/photos/92080/pexels-photo-92080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Eras Gamemode"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Eras Quizzes
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Dive into the past and guess songs from different decades! How
                  well do you know the music of the '70s, '80s, and beyond?
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ py: 5, backgroundColor: "#edf2f7", textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="h6" gutterBottom>
            <Link href="#about" color="inherit" underline="hover">
              About Us
            </Link>
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#4a5568", maxWidth: "600px", mx: "auto" }}
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
