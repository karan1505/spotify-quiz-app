const config = {
  BASE_URL: "https://spotify-quiz-app-abuw.onrender.com",
  LOGIN_URL: "/login",
  DASHBOARD_URL: "/dashboard",
  ENDPOINTS: {
    USER_INFO: "/user_info",
    USER_PLAYLISTS: "/user_playlists",
    GLOBAL_PLAYLISTS: "/global-top-playlists", // Updated to match backend endpoint
    TRACK_PREVIEW: "/track_preview",
  },
};

export default config;