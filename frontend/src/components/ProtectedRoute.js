import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Box, CircularProgress } from "@mui/material";
import config from "../config";

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    axios
      .get(`${config.BASE_URL}${config.ENDPOINTS.USER_INFO}`)
      .then(() => setStatus("authenticated"))
      .catch((error) => {
        if (error.response?.status === 401) {
          setStatus("unauthenticated");
        } else {
          // Network/CORS error in local dev — don't false-redirect
          setStatus("authenticated");
        }
      });
  }, []);

  if (status === "loading") {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
