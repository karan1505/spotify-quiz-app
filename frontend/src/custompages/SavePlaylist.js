import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Container,
  DialogContentText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import config from "../config";

const SavePlaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingDialogOpen, setLoadingDialogOpen] = useState(false);
  const [showConditions, setShowConditions] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilteredPlaylists = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}/filtered_playlists`
        );
        setPlaylists(response.data.filtered_playlists || []);
      } catch (error) {
        console.error("Failed to fetch filtered playlists:", error);
      }
    };

    fetchFilteredPlaylists();
  }, []);

  const handleCardClick = (playlist) => {
    if (isProcessing) return;
    setSelectedPlaylist(playlist);
    setDialogOpen(true);
  };

  const handleSubmitPlaylist = async () => {
    if (!selectedPlaylist || isProcessing) return;

    setDialogOpen(false);
    setLoadingDialogOpen(true);
    setIsProcessing(true);

    try {
      await axios.post(`${config.BASE_URL}/extract_playlist`, {
        playlistId: selectedPlaylist.id,
        playlistName: selectedPlaylist.name,
      });

      alert(
        "Your playlist has been processed! Go to the saved playlists section on the dashboard to test yourself!"
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error processing playlist:", error);
      alert("There was an error submitting your playlist. Please try again.");
    } finally {
      setIsProcessing(false);
      setLoadingDialogOpen(false);
    }
  };

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
        <Dialog
          open={showConditions}
          onClose={() => setShowConditions(false)}
          aria-labelledby="conditions-dialog"
        >
          <DialogTitle id="conditions-dialog">
            Conditions to Save a Playlist
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              To be able to save a playlist, it needs to meet the following
              conditions:
            </Typography>
            <ul>
              <li>The playlist must have at least 20 tracks</li>
              <li>The playlist must be public and part of your library</li>
            </ul>
            <p>
              Note:{" "}
              <a href="https://open.spotify.com/playlist/7uIc9yfi4ShpTpuYU0E6u8?si=bfd099a3710f49a5">
                The Master Playlist
              </a>{" "}
              contains all the songs we currently support, if your playlist is
              composed of these songs, you can expect it to be ready to play
              within 30 seconds.
            </p>
            <p>
              Gathering tracks is a resource intensive web process, and it
              cannot be guaranteed to succeed, it is highly recommended to stick
              to the tracks in the master playlist while making a playlist to
              quiz yourself on. If a track you want isn't on there, let us know
              in the About Us section.
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConditions(false)} color="primary">
              OK, Got It
            </Button>
          </DialogActions>
        </Dialog>
        ;
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
          Your Playlists
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {playlists.map((playlist) => (
            <Grid item xs={12} sm={6} md={4} key={playlist.id}>
              <Card
                sx={{
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  bgcolor: "#ffffff",
                  boxShadow: 3,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                onClick={() => handleCardClick(playlist)}
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
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, textAlign: "center" }}
                  >
                    {playlist.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", color: "#4a5568" }}
                  >
                    {playlist.description || "No description available"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Submit Playlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit the playlist "
            {selectedPlaylist?.name}"? Once processed, it will be available for
            quizzes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPlaylist}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog open={loadingDialogOpen} disableEscapeKeyDown>
        <DialogContent>
          <Box textAlign="center">
            <CircularProgress />
            <Typography variant="body1" mt={2}>
              Please wait while your playlist is being processed. Do not
              navigate away from this page. This might take a long time or fail
              if too many songs are out of the master playlist.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SavePlaylist;
