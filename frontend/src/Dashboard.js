import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, Card, CardContent, CardMedia, Avatar, Box, Grid, Button } from "@mui/material";
import config from "./config"; // Import the configuration file
import { useNavigate } from "react-router-dom"; // Use useNavigate

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [globalPlaylists, setGlobalPlaylists] = useState([]);
  const navigate = useNavigate(); // Use the navigate function

  useEffect(() => {
    axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

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
        setPlaylists(response.data.items); // Set the playlists data
      } catch (error) {
        console.error("Failed to fetch user playlists:", error);
      }
    };

    const fetchGlobalPlaylists = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}${config.ENDPOINTS.GLOBAL_PLAYLISTS}`
        );
        setGlobalPlaylists(response.data.global_top_playlists.slice(0, 3)); // Top 3 global playlists
      } catch (error) {
        console.error("Failed to fetch global playlists:", error);
      }
    };

    fetchUserInfo();
    fetchUserPlaylists();  // Fetch user playlists
    fetchGlobalPlaylists();
  }, []);

  // Function to sign out the user
  const signOut = async () => {
    try {
      const newWindow = window.open('https://accounts.spotify.com/en/logout', '_blank');
      setTimeout(() => {
        if (newWindow) {
          newWindow.close();
        }
      },500);
      // Redirect to the welcome page after logout
      navigate("/");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  }; 
  
  if (!userInfo) {
    return <div>Loading...</div>;
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
      </Box>

      <Typography variant="h5" component="h2" gutterBottom>
        Top 3 Global Playlists
      </Typography>
      <Grid container spacing={3}>
        {globalPlaylists.map((playlist) => (
          <Grid item xs={12} md={4} key={playlist.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={playlist.image || "https://via.placeholder.com/140"}
                alt={playlist.name}
              />
              <CardContent>
                <Typography variant="h6">{playlist.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {playlist.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
                image={playlist.images[0]?.url || "https://via.placeholder.com/140"}
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

      {/* Sign out button */}
      <Box textAlign="center" mt={5}>
        <Button variant="contained" color="secondary" onClick={signOut}>
          Sign Out
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;
