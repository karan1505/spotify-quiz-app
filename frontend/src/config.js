const config = {
  BASE_URL: "http://127.0.0.1:8000", // Backend URL — must match cookie host (127.0.0.1, not localhost)
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
