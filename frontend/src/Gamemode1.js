import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CardMedia,
  CardActionArea,
} from "@mui/material";
import config from "./config";

const Gamemode1 = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchGamemode1 = async () => {
      try {
        axios.defaults.withCredentials = true; // Ensures cookies are sent with the request
        const response = await axios.get(`${config.BASE_URL}/fetch_gamemode1`);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Failed to fetch gamemode1 data:", error);
      }
    };

    fetchGamemode1();
  }, []);

  const handleAnswerClick = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (
      option.name === currentQuestion.correct_option.name &&
      option.artist === currentQuestion.correct_option.artist
    ) {
      setScore((prev) => prev + 1);
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setShowResults(true);
    }
  };

  if (!questions.length) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h4">Loading questions...</Typography>
      </Box>
    );
  }

  if (showResults) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h4">Quiz Completed!</Typography>
        <Typography variant="h5">
          Your Score: {score} / {questions.length}
        </Typography>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box textAlign="center" mt={4} px={2}>
      <Typography variant="h4" mb={2}>
        Gamemode 1 Quiz
      </Typography>
      <Card
        style={{
          margin: "20px auto",
          padding: "20px",
          maxWidth: 800,
          borderRadius: 16,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Question {currentQuestionIndex + 1}
          </Typography>
          {/* Invisible video tag to preserve autoplay */}
          <video
            autoPlay
            src={currentQuestion.audio_preview_url}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              overflow: "hidden",
              opacity: 0,
            }}
          />
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {currentQuestion.options.map((option, index) => (
              <Grid item key={index}>
                <Card
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <CardActionArea
                    onClick={() => handleAnswerClick(option)}
                    style={{ height: "100%" }}
                  >
                    <CardMedia
                      component="img"
                      image={option.album_cover}
                      alt={`${option.name} album cover`}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </CardActionArea>
                </Card>
                <Box
                  mt={1}
                  style={{
                    width: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                  }}
                >
                  <Typography
                    variant="body2"
                    style={{ textAlign: "center", fontWeight: 600 }}
                  >
                    {option.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    style={{
                      textAlign: "center",
                      wordWrap: "break-word",
                      display: "block",
                    }}
                  >
                    {option.artist}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Gamemode1;
