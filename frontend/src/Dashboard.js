import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Fetch user info from the backend
        const response = await axios.get("http://localhost:8000/user_info", {
          withCredentials: true,
        });
        setUserInfo(response.data.user_info);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    const fetchUserPlaylists = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/user_playlists`,
          {
            withCredentials: true,
          }
        );
        setPlaylists(response.data.items); // Assuming response has `items` array
      } catch (error) {
        console.error("Failed to fetch user playlists:", error);
      }
    };

    fetchUserInfo();
    fetchUserPlaylists();
  }, []);

  // Fetch preview URL of a specific track
  const fetchTrackPreview = async (trackId) => {
    try {
      const response = await axios.get(`http://localhost:8000/track_preview`, {
        params: { track_id: trackId },
        withCredentials: true,
      });
      setPreviewUrl(response.data.preview_url);
    } catch (error) {
      console.error("Failed to fetch track preview:", error);
    }
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard, {userInfo.display_name}!</h1>
      <p>Email: {userInfo.email}</p>
      <p>Spotify ID: {userInfo.id}</p>

      {/* Display the user's playlists with artwork and details */}
      <h2>Your Playlists:</h2>
      <div>
        {playlists.map((playlist) => (
          <div key={playlist.id} style={{ marginBottom: "20px" }}>
            {playlist.images[0]?.url && (
              <img
                src={playlist.images[0].url}
                alt={`${playlist.name} cover`}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            )}
            <h3>{playlist.name}</h3>
            <p>{playlist.description || "No description available."}</p>
            <p>Total Tracks: {playlist.tracks.total}</p>
          </div>
        ))}
      </div>

      {/* Button to play the preview of a specific track */}
      <button onClick={() => fetchTrackPreview("2plbrEY59IikOBgBGLjaoe")}>
        Play Preview
      </button>

      {/* Audio player for the preview */}
      {previewUrl && (
        <audio controls src={previewUrl}>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default Dashboard;
