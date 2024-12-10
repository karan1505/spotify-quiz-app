import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import config from "config";

// Styled components (no changes needed)
const Root = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `url(https://images.unsplash.com/photo-1590310182704-037fe3509ada?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) no-repeat center center fixed`,
  backgroundSize: "cover",
  padding: theme.spacing(5, 0),
}));

const Header = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  color: "#fff",
  textShadow: "0px 2px 4px rgba(0, 0, 0, 0.8)",
  marginBottom: theme.spacing(4),
  fontWeight: 700,
}));

const Overlay = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.85)",
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
}));

const QuizCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.4)",
  },
}));

const Scoreboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/get_scores`);
        setScores(response.data.scores || []);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (scores.length === 0) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6" color="textSecondary">
          No scores found. Go play some quizzes!
        </Typography>
      </Box>
    );
  }

  // Group scores by quiz name and calculate overall performance
  const quizzes = scores.reduce((acc, score) => {
    const { quiz_name, score: userScore } = score;
    if (!acc[quiz_name]) {
      acc[quiz_name] = { totalScore: 0, maxScore: 0, scores: [] };
    }
    acc[quiz_name].scores.push(score);
    acc[quiz_name].totalScore += userScore;
    acc[quiz_name].maxScore += 5; // Assuming 5 points per question
    return acc;
  }, {});

  return (
    <Root>
      <Container maxWidth="lg">
        <Header variant="h3">Your Quiz Scoreboard</Header>
        <Overlay>
          <Grid container spacing={4}>
            {Object.keys(quizzes).map((quizName) => {
              const { totalScore, maxScore, scores } = quizzes[quizName];
              const overallPercentage = ((totalScore / maxScore) * 100).toFixed(
                2
              );

              return (
                <Grid item xs={12} sm={6} md={4} key={quizName}>
                  <QuizCard>
                    <CardContent>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          color: "#333",
                          marginBottom: 2,
                        }}
                      >
                        {quizName}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                          marginBottom: 2,
                          color: "green",
                        }}
                      >
                        Overall Performance: {overallPercentage}%
                      </Typography>
                      {scores.map((score, index) => {
                        const localTime = new Intl.DateTimeFormat(
                          navigator.language,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            second: "numeric",
                          }
                        ).format(new Date(score.timestamp));
                        return (
                          <Box key={index} sx={{ marginBottom: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {score.user_name} - {score.score} points
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              {localTime}
                            </Typography>
                          </Box>
                        );
                      })}
                    </CardContent>
                  </QuizCard>
                </Grid>
              );
            })}
          </Grid>
        </Overlay>
      </Container>
    </Root>
  );
};

export default Scoreboard;
