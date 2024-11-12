import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Avatar,
  Box,
  Grid,
} from "@mui/material";

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:8000/user_info", {
          withCredentials: true,
        });
        setUserInfo(response.data.user_info);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    const fetchUserPlaylists = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/user_playlists`,
          {
            withCredentials: true,
          }
        );
        setPlaylists(response.data.items);
      } catch (error) {
        console.error("Failed to fetch user playlists:", error);
      }
    };

    fetchUserInfo();
    fetchUserPlaylists();
  }, []);

  const fetchTrackPreview = async (trackId) => {
    try {
      const response = await axios.get(`http://localhost:8000/track_preview`, {
        params: { track_id: trackId },
        withCredentials: true,
      });
      setPreviewUrl(response.data.preview_url);
    } catch (error) {
      console.error("Failed to fetch track preview:", error);
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
        Your Playlists
      </Typography>
      <Grid container spacing={3}>
        {playlists.map((playlist) => (
          <Grid item xs={12} sm={6} md={4} key={playlist.id}>
            <Card>
              {playlist.images[0]?.url && (
                <CardMedia
                  component="img"
                  height="140"
                  image={playlist.images[1].url}
                  alt={`${playlist.name} cover`}
                />
              )}
              <CardContent>
                <Typography variant="h6" component="h3">
                  {playlist.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {playlist.description || "No description available."}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Tracks: {playlist.tracks.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fetchTrackPreview("2plbrEY59IikOBgBGLjaoe")}
        >
          Play Preview
        </Button>
        {previewUrl && (
          <Box mt={2}>
            <audio controls src={previewUrl}>
              Your browser does not support the audio element.
            </audio>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
