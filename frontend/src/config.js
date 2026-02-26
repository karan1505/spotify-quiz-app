const config = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
  LOGIN_URL: "/login",
  DASHBOARD_URL: "/dashboard",
  ENDPOINTS: {
    USER_INFO: "/user_info",
    USER_PLAYLISTS: "/user_playlists",
    GLOBAL_PLAYLISTS: "/global-top-playlists",
    TRACK_PREVIEW: "/track_preview",
  },
};

export default config;
