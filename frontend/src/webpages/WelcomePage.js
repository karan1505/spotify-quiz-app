import React, { useState } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import config from "../config";

const SCREENSHOT_COUNT = 9;

const DemoModal = ({ open, onClose }) => {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + SCREENSHOT_COUNT) % SCREENSHOT_COUNT);
  const next = () => setIndex((i) => (i + 1) % SCREENSHOT_COUNT);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Quizzify — Screenshots
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <IconButton onClick={prev}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Box
            component="img"
            src={`/images/screenshot${index + 1}.png`}
            alt={`Screenshot ${index + 1}`}
            sx={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: 1 }}
          />
          <IconButton onClick={next}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" align="center" display="block" sx={{ mt: 1, color: "text.secondary" }}>
          {index + 1} / {SCREENSHOT_COUNT}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

const AccessModal = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      Request Access
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" gutterBottom>
        Quizzify uses Spotify OAuth for authentication. Because the app is currently in Spotify's development mode, only
        whitelisted accounts can sign in.
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
        To try the app, email either of us with your Spotify account email and we'll add you to the allowlist:
      </Typography>
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2">
          <strong>Karan Sreedhar</strong> —{" "}
          <a href="mailto:karansreedhar15@gmail.com" style={{ color: "#1DB954" }}>
            karansreedhar15@gmail.com
          </a>
        </Typography>
        <Typography variant="body2">
          <strong>Srinath Ganesh</strong> —{" "}
          <a href="mailto:srinath.ganesh@outlook.com" style={{ color: "#1DB954" }}>
            srinath.ganesh@outlook.com
          </a>
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        We'll add you to the allowlist within 24 hours.
      </Typography>
    </DialogContent>
  </Dialog>
);

const WelcomePage = () => {
  const [demoOpen, setDemoOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setDemoOpen(true)}
            sx={{
              bgcolor: "#2b6cb0",
              color: "#ffffff",
              "&:hover": { bgcolor: "#3182ce" },
              px: 4,
              py: 1.5,
              borderRadius: "20px",
              fontWeight: 600,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            Watch Demo
          </Button>
          <Button
            variant="contained"
            onClick={handleSignIn}
            sx={{
              bgcolor: "#1DB954",
              color: "#ffffff",
              "&:hover": { bgcolor: "#17a349" },
              px: 4,
              py: 1.5,
              borderRadius: "20px",
              fontWeight: 600,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            Sign In with Spotify
          </Button>
          <Button
            variant="contained"
            onClick={() => setAccessOpen(true)}
            sx={{
              bgcolor: "#3182ce",
              color: "#ffffff",
              "&:hover": { bgcolor: "#2b6cb0" },
              px: 4,
              py: 1.5,
              borderRadius: "20px",
              fontWeight: 600,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            Request Access
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
          {[
            {
              title: "Top 50 Global",
              description: "Guess this week's chart-topping tracks against the clock",
              image:
                "https://wallpapersok.com/images/thumbnail/spotify-playlist-music-aesthetic-plm48h2zvnjcebnf.jpg",
            },
            {
              title: "Artist Quizzes",
              description: "Deep dives into Taylor Swift, Queen, Michael Jackson, and more",
              image:
                "https://www.rollingstone.com/wp-content/uploads/2019/01/26-those-shoes-eagles-songs-1979.jpg?w=800",
            },
            {
              title: "Genre Challenges",
              description: "Hip-hop, rock classics, soft pop — pick your lane",
              image:
                "https://americanrootsmusicfall2016.wordpress.com/wp-content/uploads/2016/12/indie-movie-vintage-favim-com-302025.jpg?w=500",
            },
            {
              title: "Era Quizzes",
              description: "70s & 80s throwbacks for the true music historians",
              image:
                "https://i.ebayimg.com/images/g/NpsAAOSwyxVgowtY/s-l1200.jpg",
            },
            {
              title: "Your Playlists",
              description: "Import any Spotify playlist and quiz yourself on your own library",
              image:
                "https://static.displate.com/857x1200/displate/2024-01-19/c8b6d06d8b9d07814f37aa8368c8838c_7bf29cdd628885c0bbfc773d015133b0.jpg",
            },
            {
              title: "Scoreboard",
              description: "Your scores are saved — track your improvement over time",
              image:
                "https://ayalabulldogtimes.org/wp-content/uploads/2023/05/Untitled-design-4-900x900.png",
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  bgcolor: "#ffffff",
                  boxShadow: 3,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
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

      {/* Footer */}
      <Box sx={{ py: 4, mt: 4, textAlign: "center" }}>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.45)" }}
        >
          Built by Karan Sreedhar &amp; Srinath Ganesh &middot; Powered by Spotify &middot; quizzify.space
        </Typography>
      </Box>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      <AccessModal open={accessOpen} onClose={() => setAccessOpen(false)} />
    </Box>
  );
};

export default WelcomePage;
