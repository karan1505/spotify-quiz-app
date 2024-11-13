import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import Link from "@mui/material/Link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import config from "./config";

const WelcomePage = () => {
  const handleSignIn = () => {
    window.location.href = `${config.BASE_URL}${config.LOGIN_URL}`;
  };

  return (
    <Box bgcolor="#121212" color="#f1f1f1" minHeight="100vh">
      <AppBar position="fixed" sx={{ bgcolor: "#1db954", zIndex: 1300 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#ffffff" }}>
            Quizzify
          </Typography>
          <Button
            variant="outlined"
            sx={{ color: "#ffffff", borderColor: "#ffffff" }}
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ marginTop: "64px" }} />

      <Container maxWidth="lg" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom sx={{ color: "#1db954" }}>
          Quizzify
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Test your music knowledge with personalized quizzes based on your
          Spotify history!
        </Typography>
      </Container>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: "#1db954" }}
        >
          Explore Our Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ bgcolor: "#2c2c2c", color: "#f1f1f1" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://plus.unsplash.com/premium_photo-1673697239909-e11521d1ba94?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZXZlbmluZ3xlbnwwfHwwfHx8MA%3D%3D+${i}`}
                  alt={`Feature ${i}`}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        sx={{
          py: 5,
          bgcolor: "#333333",
          color: "#ffffff",
          textAlign: "center",
          width: "100vw",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h6" gutterBottom sx={{ color: "#1db954" }}>
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
              sx={{ color: "#1db954" }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              href="https://twitter.com"
              target="_blank"
              sx={{ color: "#1db954" }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              href="https://instagram.com"
              target="_blank"
              sx={{ color: "#1db954" }}
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
