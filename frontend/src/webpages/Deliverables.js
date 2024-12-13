import React from "react";
import { Container, Typography, Box } from "@mui/material";
import pdfFile from "../documents/Project Deliverables for Quizzify.pdf";

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
          This page outlines the deliverables for the project.
        </Typography>
        <Typography variant="body2" sx={{ color: "#718096" }}>
          This page includes a detailed deliverables list including screenshots to show their working.
        </Typography>
                {/* Embedding the PDF */}
                <Box
          sx={{
            width: "100%",
            height: "70vh", // Adjust the height as needed
            border: "1px solid #cbd5e0", // Border for styling
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <iframe
            src={pdfFile} // Use the same imported PDF
            title="Deliverables Guide PDF"
            width="100%"
            height="100%"
            style={{
              border: "none",
              backgroundColor: "#edf2f7", // Match light background
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Deliverables;
