import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import config from "../config";
import BackButton from "../components/BackButton";

const PlaylistImageFallback = () => (
  <Box
    sx={{
      height: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#e0e0e0",
    }}
  >
    <MusicNoteIcon sx={{ fontSize: 64, color: "#9e9e9e" }} />
  </Box>
);

const RemovePlaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchSavedPlaylists = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/saved_playlists`);
        setPlaylists(response.data.saved_playlists);
      } catch {
        setSnackbar({ open: true, message: "Failed to load playlists.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPlaylists();
  }, []);

  const handleRemovePlaylist = async () => {
    try {
      await axios.delete(`${config.BASE_URL}/remove_playlist`, {
        data: { playlistId: selectedPlaylist.id },
      });

      setPlaylists(
        playlists.filter((playlist) => playlist.id !== selectedPlaylist.id)
      );
      setSnackbar({ open: true, message: "Playlist removed successfully.", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to remove playlist. Please try again.", severity: "error" });
    } finally {
      setDialogOpen(false);
      setSelectedPlaylist(null);
    }
  };

  const openDialog = (playlist) => {
    setSelectedPlaylist(playlist);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedPlaylist(null);
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!playlists.length) {
    return (
      <Box textAlign="center" mt={5}>
        <BackButton />
        <Typography variant="h6" color="textSecondary">
          No saved playlists found.
        </Typography>
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
      <BackButton />
      <Container maxWidth="lg">
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
          Your Saved Playlists
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {playlists.map((playlist) => (
            <Grid item xs={12} sm={6} md={4} key={playlist.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  boxShadow: 3,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                onClick={() => openDialog(playlist)}
              >
                {playlist.images?.[0]?.url ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={playlist.images[0].url}
                    alt={playlist.name}
                  />
                ) : (
                  <PlaylistImageFallback />
                )}
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {playlist.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {playlist.tracks.total} Tracks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Remove Playlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove the playlist "
            {selectedPlaylist?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleRemovePlaylist}
            color="error"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RemovePlaylist;
