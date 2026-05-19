import React from "react";
import { Box, Typography, Button, Card } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minHeight="100vh"
          sx={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            sx={{
              p: 5,
              textAlign: "center",
              maxWidth: 420,
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body1" sx={{ color: "#4a5568", mb: 3 }}>
              An unexpected error occurred. Please try reloading the page.
            </Typography>
            <Button
              variant="contained"
              onClick={this.handleReload}
              sx={{
                bgcolor: "#1DB954",
                color: "#fff",
                "&:hover": { bgcolor: "#17a349" },
                px: 4,
                py: 1.5,
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              Reload Page
            </Button>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
