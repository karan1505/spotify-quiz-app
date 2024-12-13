import React from "react";
import { Container, Typography, Box } from "@mui/material";
import pdfFile from "../documents/Instructions and Troubleshooting to use Quizzify.pdf";

const Troubleshooting = () => {
  return (
    <Box
      minHeight="100vh"
      sx={{
        backgroundColor: "#1a202c", // Dark background
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
            color: "#edf2f7", // Light text for better contrast
          }}
        >
          Troubleshooting Guide
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            color: "#cbd5e0", // Slightly muted light text
          }}
        >
          If you're facing issues, follow these steps to troubleshoot. This
          section will guide you through common problems and their solutions.
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: "#a0aec0" }}>
          This page includes a detailed troubleshooting guide in PDF format.
        </Typography>

        {/* Embedding the PDF */}
        <Box
          sx={{
            width: "100%",
            height: "70vh", // Adjust the height as needed
            border: "1px solid #2d3748", // Border for styling
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <iframe
            src={pdfFile}
            title="Troubleshooting Guide PDF"
            width="100%"
            height="100%"
            style={{
              border: "none",
              backgroundColor: "#1a202c", // Match dark background
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Troubleshooting;
