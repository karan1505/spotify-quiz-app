import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Get the access_token from the URL
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");

    const fetchUserInfo = async () => {
      try {
        // Make a request to the backend to fetch user info using the access_token
        const response = await axios.get("http://localhost:8000/user_info", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUserInfo(response.data.user_info);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    if (accessToken) {
      fetchUserInfo();
    }
  }, [location]);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard, {userInfo.display_name}!</h1>
      <p>Email: {userInfo.email}</p>
      <p>Spotify ID: {userInfo.id}</p>
    </div>
  );
};

export default Dashboard;
