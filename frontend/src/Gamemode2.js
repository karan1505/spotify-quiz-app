import React, { useEffect } from "react";
import axios from "axios";
import config from "./config";

const Gamemode2 = () => {
  useEffect(() => {
    const fetchGamemode2 = async () => {
      try {
        axios.defaults.withCredentials = true; // Ensures cookies are sent with the request
        const response = await axios.get(`${config.BASE_URL}/extract_playlist`);
        console.log("Gamemode2 response:", response.data);
      } catch (error) {
        console.error("Failed to fetch gamemode2 data:", error);
      }
    };

    fetchGamemode2();
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

export default Gamemode2;
