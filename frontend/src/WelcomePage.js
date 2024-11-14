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
import IconButton from "@mui/material/IconButton";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import Link from "@mui/material/Link";
import config from "./config"; // Import the config file

const WelcomePage = () => {
  const handleSignIn = () => {
    document.cookie = "access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    sessionStorage.clear();
    window.location.href = `${config.BASE_URL}/login`;
  };

  return (
    <Box minHeight="100vh" sx={{ backgroundColor: "#f9f9f9" }}>
      <Container maxWidth="lg" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom sx={{ color: "#000000" }}>
          Quizzify
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Test your music knowledge with personalized quizzes based on your
          Spotify history!
        </Typography>

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              bgcolor: "#1e88e5", // Blue color to match Gamemode1
              color: "#ffffff",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: "#000000" }}
        >
          Explore Our Gamemodes
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ bgcolor: "#ffffff", boxShadow: 2 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://via.placeholder.com/300?text=Gamemode+${i}`} // Placeholder image for each gamemode
                  alt={`Gamemode ${i}`}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ color: "#000000" }}>
                    Gamemode {i}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Description for Gamemode {i}. This gamemode challenges your
                    music knowledge in unique and fun ways!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ py: 5, backgroundColor: "#f9f9f9", textAlign: "center" }}>
        <Container maxWidth="lg">
          <Typography variant="h6" gutterBottom sx={{ color: "#000000" }}>
            <Link href="#about" color="inherit" underline="hover">
              About Us
            </Link>
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            maxWidth="sm"
            mx="auto"
            mb={2}
          >
            Our Spotify Quiz App is created for music lovers. Challenge yourself
            and see how well you know your favorite songs and artists. Connect
            with Spotify for a personalized quiz experience!
          </Typography>

          <Box>
            <IconButton
              href="https://facebook.com"
              target="_blank"
              sx={{ color: "#1e88e5" }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              href="https://twitter.com"
              target="_blank"
              sx={{ color: "#1e88e5" }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              href="https://instagram.com"
              target="_blank"
              sx={{ color: "#1e88e5" }}
            >
              <InstagramIcon />
            </IconButton>
          </Box>

          <Typography
            variant="caption"
            display="block"
            color="textSecondary"
            mt={3}
          >
            © 2024 Spotify Quiz App. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;
