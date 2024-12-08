import React from "react";
import { Container, Typography, Box } from "@mui/material";

const Deliverables = () => {
  return (
    <Box
      minHeight="100vh"
      sx={{
        backgroundColor: "#edf2f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center", p: 3 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 700,
            color: "#2c5282",
          }}
        >
          Project Deliverables
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            color: "#4a5568",
          }}
        >
          This page outlines the deliverables for the project. Here you can find
          reports, presentations, and other related documents.
        </Typography>
        <Typography variant="body2" sx={{ color: "#718096" }}>
          This page is a placeholder. Add links or detailed information about
          the deliverables here.
        </Typography>
      </Container>
    </Box>
  );
};

export default Deliverables;
