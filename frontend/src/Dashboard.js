import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Box,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import config from "./config";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  // const [playlists, setPlaylists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.defaults.withCredentials = true;

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}${config.ENDPOINTS.USER_INFO}`
        );
        setUserInfo(response.data.user_info);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    // const fetchUserPlaylists = async () => {
    //   try {
    //     const response = await axios.get(
    //       `${config.BASE_URL}${config.ENDPOINTS.USER_PLAYLISTS}`
    //     );
    //     setPlaylists(response.data.items);
    //   } catch (error) {
    //     console.error("Failed to fetch user playlists:", error);
    //   }
    // };

    fetchUserInfo();
    // fetchUserPlaylists();
  }, []);

  const signOut = async () => {
    try {
      document.cookie =
        "access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;SameSite=None;HttpOnly";
      const newWindow = window.open(
        "https://accounts.spotify.com/en/logout",
        "_blank"
      );
      setTimeout(() => {
        if (newWindow) {
          newWindow.close();
        }
      }, 500);
      navigate("/");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  if (!userInfo) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
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
        {/* User Info */}
        <Box display="flex" alignItems="center" mb={5}>
          <Avatar
            src={userInfo.images?.[0]?.url}
            alt={userInfo.display_name}
            sx={{
              width: 100,
              height: 100,
              marginRight: 3,
              border: "3px solid #1e88e5",
            }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: "#fff", // Shortened color code for better readability
                textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)", // Adds a subtle shadow for better contrast
                fontWeight: 600, // Enhances readability by adding weight
                fontSmoothing: "antialiased", // Ensures text rendering is smooth
              }}
            >
              Welcome, {userInfo.display_name}!
            </Typography>

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
              onClick={signOut}
            >
              Sign Out
            </Button>
          </Box>
        </Box>

        {/* Curated Playlists */}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            color: "#fff", // Shortened color code for better readability
            textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)", // Adds a subtle shadow for better contrast
            fontWeight: 500, // Enhances readability by adding weight
            fontSmoothing: "antialiased", // Ensures text rendering is smooth
            mb: 3,
          }}
        >
          Curated Playlist Quizzes
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/gamemode1")}
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg"
                alt="Top 50 Global Song Quiz"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top 50 Global Song Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Can you guess this week's top hits?
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/gamemode1")}
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://images.pexels.com/photos/12204293/pexels-photo-12204293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Top 50 Global Song Quiz"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  80's Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  How well do you know your 80's music?
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/gamemode1")}
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://cdn.pixabay.com/photo/2017/02/22/16/04/guitar-2089802_1280.jpg"
                alt="Top 50 Global Song Quiz"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  70's Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Let's go back in time, are you ready?
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/gamemode1")}
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg"
                alt="Top 50 Global Song Quiz"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top 50 Global Song Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Test your music knowledge and see if you can guess this week's
                  top hits!
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/gamemode1")}
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg"
                alt="Top 50 Global Song Quiz"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top 50 Global Song Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Test your music knowledge and see if you can guess this week's
                  top hits!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Sections */}
        <Box mt={5}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ color: "#ffffff", mb: 3 }}
          >
            User Playlists
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {/* Utility Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/customgamemode")}
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Custom Gamemode"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Play Your Saved Playlists
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Play one of your saved playlists and test how well you know
                  your own playlists!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/customgamemode")}
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://cdn.pixabay.com/photo/2020/01/31/19/26/vinyl-4808792_1280.jpg"
                alt="Custom Gamemode"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Save a Playlist
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Create to play with custom playlists from your library!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/gamemode1")}
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image="https://cdn.pixabay.com/photo/2016/11/22/19/15/hand-1850120_1280.jpg"
                alt="Delete Playlist"
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Delete Playlist
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Delete a saved playlist from our servers, note that we don't
                  store any private playlists or personal data
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
