import { Games } from "@mui/icons-material";
import React from "react";

function Gamemode2() {
  const previewUrl =
    "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/31/8b/ba/318bba65-f013-2f0b-6135-c06eb6d7ad93/mzaf_12517872678569950249.plus.aac.ep.m4a";

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
      <h1>Apple Music Preview</h1>
      <audio controls>
        <source src={previewUrl} type="audio/mp4" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default Gamemode2;
