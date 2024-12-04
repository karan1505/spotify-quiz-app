import React, { useEffect } from "react";
import axios from "axios";
import config from "./config";

const ExtractPlaylist = () => {
  useEffect(() => {
    const fetchExtractPlaylist = async () => {
      try {
        axios.defaults.withCredentials = true; // Ensures cookies are sent with the request
        const response = await axios.get(`${config.BASE_URL}/extract_playlist`);
        console.log("ExtractPlaylist response:", response.data);
      } catch (error) {
        console.error("Failed to fetch ExtractPlaylist data:", error);
      }
    };

    fetchExtractPlaylist();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Game Mode 2</h1>
      <p>Generating playlist data. Please check the JSON file on the server.</p>
    </div>
  );
};

export default ExtractPlaylist;
