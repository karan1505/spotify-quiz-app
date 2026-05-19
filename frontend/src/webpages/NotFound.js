import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            color: "#1DB954",
            fontSize: { xs: "6rem", md: "8rem" },
            lineHeight: 1,
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h5"
          sx={{ color: "#fff", fontWeight: 600, mb: 1 }}
        >
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            bgcolor: "#1DB954",
            color: "#fff",
            "&:hover": { bgcolor: "#17a349" },
            px: 4,
            py: 1.5,
            borderRadius: "20px",
            fontWeight: 600,
          }}
        >
          Back to Home
        </Button>
      </Container>
    </Box>
  );
};

export default NotFound;
