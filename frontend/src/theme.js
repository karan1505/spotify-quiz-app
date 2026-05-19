import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1DB954",
      dark: "#17a349",
    },
    secondary: {
      main: "#2b6cb0",
      light: "#3182ce",
    },
    success: {
      main: "#4caf50",
      dark: "#43a047",
    },
    error: {
      main: "#f44336",
    },
    text: {
      primary: "#333",
      secondary: "#4a5568",
      hint: "#555",
    },
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

export default theme;
