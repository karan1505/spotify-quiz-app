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
  const [playlists, setPlaylists] = useState([]);
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
    

    const fetchUserPlaylists = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}${config.ENDPOINTS.USER_PLAYLISTS}`
        );
        setPlaylists(response.data.items);
      } catch (error) {
        console.error("Failed to fetch user playlists:", error);
      }
    };

    fetchUserInfo();
    fetchUserPlaylists();
  }, []);

  const signOut = async () => {
    try {
      // Clear the cookie with SameSite=None and Secure attributes
      document.cookie = "access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;SameSite=None;HttpOnly";
      
      // Open Spotify logout in a new window
      const newWindow = window.open(
        "https://accounts.spotify.com/en/logout",
        "_blank"
      );
      setTimeout(() => {
        if (newWindow) {
          newWindow.close();
        }
      }, 500);
  
      // Redirect to the homepage
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
    <Container maxWidth="md">
      <Box textAlign="center" mt={5} mb={3}>
        <Avatar
          src={userInfo.images?.[0]?.url}
          alt={userInfo.display_name}
          sx={{ width: 100, height: 100, margin: "auto" }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {userInfo.display_name}!
        </Typography>
        <Typography variant="body1">Email: {userInfo.email}</Typography>
        <Typography variant="body1">Spotify ID: {userInfo.id}</Typography>
        <Box mt={2}>
          <Button variant="contained" color="secondary" onClick={signOut}>
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* Game Mode Card */}
      <Box mt={5} mb={3}>
        <Card
          onClick={() => navigate("/gamemode1")}
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
            image="https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" // Replace with actual image URL if available
            alt="Game Mode 1"
          />
          <CardContent>
            <Typography variant="h5" component="h2">
              Can you guess the top songs of the week?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Test your music knowledge and see if you can guess this week's top
              hits!
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Placeholder Coming Soon Card */}
      <Box mt={5} mb={3}>
        <Card
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
            image="https://earlsribpalace.com/wp-content/uploads/2019/07/coming-soon-store-placeholder-image.gif" // Replace with actual image URL if available
            alt="Coming Soon"
          />
          <CardContent>
            <Typography variant="h5" component="h2">
              Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stay tuned for more exciting challenges!
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* User Playlists */}
      <Typography variant="h5" component="h2" gutterBottom mt={5}>
        Your Playlists
      </Typography>
      <Grid container spacing={3}>
        {playlists.map((playlist) => (
          <Grid item xs={12} md={4} key={playlist.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={
                  playlist.images[0]?.url || "https://via.placeholder.com/140"
                }
                alt={playlist.name}
              />
              <CardContent>
                <Typography variant="h6">{playlist.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {playlist.description || "No description available."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
