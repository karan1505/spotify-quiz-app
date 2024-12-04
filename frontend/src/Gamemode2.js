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
  Button,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion"; // For animation
import config from "./config";

const Gamemode2 = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false); // Controls the start button
  const [isLoading, setIsLoading] = useState(false); // Timer state for next question

  useEffect(() => {
    const fetchGamemode1 = async () => {
      try {
        axios.defaults.withCredentials = true; // Ensures cookies are sent with the request
        const response = await axios.get(`${config.BASE_URL}/fetch_gamemode1`);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Failed to fetch Gamemode2 data:", error);
      }
    };

    fetchGamemode1();
  }, []);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerClick = (option) => {
    if (isLoading) return; // Prevent multiple clicks during timer
    setIsLoading(true);

    const currentQuestion = questions[currentQuestionIndex];
    if (
      option.name === currentQuestion.correct_option.name &&
      option.artist === currentQuestion.correct_option.artist
    ) {
      setScore((prev) => prev + 1);
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    setTimeout(() => {
      if (nextQuestionIndex < questions.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
      } else {
        setShowResults(true);
      }
      setIsLoading(false);
    }, 2000); // 2-second delay before showing next question
  };

  if (!questions.length) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h4">Loading questions...</Typography>
      </Box>
    );
  }

  if (!quizStarted) {
    return (
      <Box
        textAlign="center"
        mt={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="h4" mb={2}>
          Welcome to Gamemode 1 Quiz
        </Typography>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartQuiz}
            style={{
              fontSize: "18px",
              padding: "10px 20px",
              borderRadius: "30px",
            }}
          >
            Start Quiz
          </Button>
        </motion.div>
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
                    style={{
                      height: "100%",
                      pointerEvents: isLoading ? "none" : "auto", // Disable clicking during timer
                    }}
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
          {isLoading && (
            <Box mt={2}>
              <CircularProgress />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Gamemode2;
