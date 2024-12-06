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
  DialogActions,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import config from "./config";

const SavePlaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    if (isProcessing) return;
    setSelectedPlaylist(playlist);
  };

  const handleFinalSubmit = async () => {
    if (!selectedPlaylist || isProcessing) return;

    setIsSubmitting(true);
    setIsProcessing(true);

    try {
      await axios.post(`${config.BASE_URL}/extract_playlist`, {
        playlistId: selectedPlaylist.id,
        playlistName: selectedPlaylist.name,
      });

      alert(
        "Request received! Your playlist is being generated. Please wait until it's complete."
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error processing playlist:", error);
      alert("There was an error submitting your playlist. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };

  const BackToDashboardButton = () => (
    <Button
      variant="contained"
      color="primary"
      onClick={() => navigate("/dashboard")}
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: "#007BFF",
        color: "#FFF",
        textTransform: "none",
      }}
      startIcon={<span>&larr;</span>}
    >
      Back
    </Button>
  );

  return (
    <Box
      minHeight="100vh"
      sx={{
        backgroundImage: `url(https://images.unsplash.com/photo-1465146633011-14f8e0781093?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        py: 5,
      }}
    >
      <Container maxWidth="lg">
        <BackToDashboardButton />
        <Box textAlign="center" mt={5}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#ffffff", fontWeight: 100 }}
          >
            Your Playlists:
          </Typography>

          {isProcessing && (
            <Box mt={3}>
              <CircularProgress />
              <Typography
                variant="body2"
                color="textSecondary"
                mt={2}
                sx={{ color: "#ffffff" }}
              >
                Your playlist is being processed. Please wait...
              </Typography>
            </Box>
          )}

          {!isProcessing && (
            <Box mt={3}>
              <Grid container spacing={3} justifyContent="center">
                {playlists.map((playlist) => (
                  <Grid item xs={12} sm={6} md={4} key={playlist.id}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        sx={{
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          border:
                            selectedPlaylist?.id === playlist.id
                              ? "2px solid #1976d2"
                              : "none",
                          boxShadow: 3,
                          transition: "transform 0.3s, border-color 0.3s",
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
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              fontWeight: 600,
                              textAlign: "center",
                              color: "#000000",
                            }}
                          >
                            {playlist.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: "center" }}
                          >
                            {playlist.description || "No description available"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              <Box mt={4} textAlign="center">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!selectedPlaylist || isSubmitting || isProcessing}
                    onClick={() => setConfirmSubmit(true)}
                  >
                    Submit
                  </Button>
                </motion.div>
              </Box>
            </Box>
          )}

          <Dialog
            open={confirmSubmit}
            onClose={() => setConfirmSubmit(false)}
            aria-labelledby="confirm-submit-dialog"
          >
            <DialogContent>
              <Typography variant="body1">
                Submitting this playlist is final. It will be saved on our
                servers and used for future quizzes. Do you want to continue?
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
      </Container>
    </Box>
  );
};

export default SavePlaylist;
