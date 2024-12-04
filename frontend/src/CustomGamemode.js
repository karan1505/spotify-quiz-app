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
  CardActions,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import config from "./config";

const CustomGamemode = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New: Track ongoing playlist processing
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}${config.ENDPOINTS.USER_PLAYLISTS}`
        );
        setPlaylists(response.data.items || []);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };

    fetchUserPlaylists();
  }, []);

  const handleCardClick = (playlist) => {
    if (isProcessing) return; // Prevent selection during processing
    setSelectedPlaylist(playlist);
  };

  const handleFinalSubmit = async () => {
    if (!selectedPlaylist || isProcessing) return;

    setIsSubmitting(true);
    setIsProcessing(true); // Lock further actions

    try {
      await axios.post(`${config.BASE_URL}/extract_playlist`, {
        playlistId: selectedPlaylist.id,
        playlistName: selectedPlaylist.name,
      });

      alert(
        "Request received! Your playlist is being generated. Please wait until it's complete."
      );

      // Optionally: Redirect or update the UI after submission
      navigate("/dashboard");
    } catch (error) {
      console.error("Error processing playlist:", error);
      alert("There was an error submitting your playlist. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false); // Unlock after completion
    }
  };

  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h4" gutterBottom>
        Custom Gamemode
      </Typography>

      {isProcessing && (
        <Box mt={3}>
          <CircularProgress />
          <Typography variant="body2" color="textSecondary" mt={2}>
            Your playlist is being processed. Please wait...
          </Typography>
        </Box>
      )}

      {!isProcessing && (
        <Box mt={3}>
          <Grid container spacing={3}>
            {playlists.map((playlist) => (
              <Grid item xs={12} sm={6} md={4} key={playlist.id}>
                <Card
                  sx={{
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    border:
                      selectedPlaylist?.id === playlist.id
                        ? "2px solid #1976d2"
                        : "none",
                  }}
                  onClick={() => handleCardClick(playlist)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={playlist.images[0]?.url || "/placeholder.jpg"}
                    alt={playlist.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {playlist.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {playlist.description || "No description available"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {selectedPlaylist?.id === playlist.id && (
                      <Typography variant="body2" color="primary">
                        Selected
                      </Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            color="primary"
            disabled={!selectedPlaylist || isSubmitting || isProcessing}
            onClick={() => setConfirmSubmit(true)}
            sx={{ mt: 3 }}
          >
            Submit
          </Button>
        </Box>
      )}

      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        aria-labelledby="confirm-submit-dialog"
      >
        <DialogContent>
          <Typography variant="body1">
            Submitting this playlist is final. It will be saved on our servers
            and used for future quizzes. Do you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmSubmit(false);
              handleFinalSubmit();
            }}
            color="primary"
          >
            Yes, Submit
          </Button>
          <Button onClick={() => setConfirmSubmit(false)} color="secondary">
            No, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomGamemode;
