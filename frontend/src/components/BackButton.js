import React from "react";
import { IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <IconButton
      onClick={() => navigate("/dashboard")}
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 1200,
        bgcolor: "rgba(255,255,255,0.9)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        "&:hover": { bgcolor: "#fff" },
      }}
    >
      <ArrowBackIosNewIcon />
    </IconButton>
  );
};

export default BackButton;
