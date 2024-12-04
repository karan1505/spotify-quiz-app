import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Grid,
  CardMedia,
  CardActionArea,
  Button,
  Slider,
} from "@mui/material";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import config from "./config";

const Gamemode1 = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default volume at 50%
  const [timeLeft, setTimeLeft] = useState(30); // Timer starts at 30 seconds
  const [selectedOptionFeedback, setSelectedOptionFeedback] = useState(null); // Tracks feedback for answer
  const timerRef = useRef(null); // Ref for the timer
  const audioRef = useRef(null); // Ref for the audio element

  // Fetch questions from the backend
  useEffect(() => {
    const fetchGamemode1 = async () => {
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(`${config.BASE_URL}/fetch_gamemode1`);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Failed to fetch gamemode1 data:", error);
      }
    };
    fetchGamemode1();
  }, []);

  // Timer management
  useEffect(() => {
    if (quizStarted && !showResults) {
      resetTimer();
    }
    return () => clearInterval(timerRef.current); // Cleanup timer
  }, [quizStarted, currentQuestionIndex, showResults]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(30); // Reset timer to 30 seconds
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setShowResults(true);
    }
    setSelectedOptionFeedback(null); // Reset feedback
    setIsLoading(false);
  };

  const handleStartQuiz = () => setQuizStarted(true);

  const handleAnswerClick = async (option) => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);
    clearInterval(timerRef.current); // Stop timer

    const currentQuestion = questions[currentQuestionIndex];

    try {
      const response = await axios.post(`${config.BASE_URL}/validate_answer`, {
        question_id: currentQuestion.question_id,
        selected_option: option,
      });

      const { is_correct } = response.data;

      setSelectedOptionFeedback({
        option,
        isCorrect: is_correct,
      });

      if (is_correct) {
        setScore((prev) => prev + 1); // Increment score
      }

      const nextQuestionIndex = currentQuestionIndex + 1;
      setTimeout(() => {
        if (nextQuestionIndex < questions.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          setShowResults(true);
        }
        setSelectedOptionFeedback(null); // Reset feedback
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error validating answer:", error);
      setIsLoading(false);
    }
  };

  const renderConfetti = () => {
    if (selectedOptionFeedback?.isCorrect) {
      return <Confetti width={window.innerWidth} height={window.innerHeight} />;
    }
  };

  const BackToDashboardButton = () => (
    <Button
      variant="contained"
      color="primary"
      onClick={() => (window.location.href = "/dashboard")}
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: "#007BFF",
        color: "#FFF",
        textTransform: "none",
      }}
      startIcon={<span>&larr;</span>}
    >
      Back
    </Button>
  );

  // Ensure questions are loaded
  if (!questions.length) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h4">Loading questions...</Typography>
      </Box>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h4">Welcome to Gamemode 1 Quiz</Typography>
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartQuiz}
            style={{ marginTop: "16px" }}
          >
            Start Quiz
          </Button>
        </motion.div>
      </Box>
    );
  }

  // Quiz results screen
  if (showResults) {
    return (
      <Box textAlign="center" mt={4}>
        <BackToDashboardButton />
        <Typography variant="h4">Quiz Completed!</Typography>
        <Typography variant="h5">
          Your Score: {score} / {questions.length}
        </Typography>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box>
      {/* AppBar for top-level navigation */}
      <AppBar
        position="static"
        style={{ padding: "0px", backgroundColor: "#f5f5f5" }}
      >
        <Toolbar
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <BackToDashboardButton />
          <Box
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Card
              style={{
                padding: "10px 60px",
                alignContent: "center",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h6" style={{ textAlign: "center" }}>
                Question {currentQuestionIndex + 1} - Time Left: {timeLeft}s
              </Typography>
            </Card>
          </Box>
          <Box display={{ xs: "none", sm: "flex" }} alignItems="center">
            {/* <Typography style={{ marginRight: 10 }}>Volume:</Typography> */}
            <Slider
              value={volume}
              onChange={(e, newValue) => {
                setVolume(newValue);
                if (audioRef.current) {
                  audioRef.current.volume = newValue;
                }
              }}
              step={0.1}
              min={0}
              max={1}
              style={{
                width: "150px",
                color: "#3f51b5",
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Card for the Question and Options */}
      <Box textAlign="center" mt={4} px={2}>
        <Card
          style={{
            margin: "0 auto",
            padding: "0px",
            maxWidth: 1000,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent>
            <audio
              ref={audioRef}
              src={currentQuestion.audio_preview_url}
              autoPlay
              onLoadedMetadata={() => {
                if (audioRef.current) audioRef.current.volume = volume;
              }}
            />
            <Grid
              container
              spacing={2}
              justifyContent="center"
              mt={2}
              style={{ maxHeight: "600px", overflow: "auto" }}
            >
              {currentQuestion.options.map((option, index) => (
                <Grid item key={index} xs={12} sm={6}>
                  <Card
                    style={{
                      border:
                        selectedOptionFeedback?.option === option
                          ? selectedOptionFeedback.isCorrect
                            ? "3px solid green"
                            : "3px solid red"
                          : "1px solid #ddd",
                      transition: "border-color 0.3s",
                      borderRadius: "8px",
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleAnswerClick(option)}
                      disabled={isLoading}
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardMedia
                        component="img"
                        src={option.album_cover}
                        alt={option.name}
                        style={{ height: "140px", objectFit: "cover" }}
                      />
                      <CardContent>
                        <Typography
                          style={{
                            fontSize: option.name.length > 20 ? "14px" : "16px",
                            textAlign: "center",
                          }}
                        >
                          {option.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          style={{ display: "block", textAlign: "center" }}
                        >
                          {option.artist}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {renderConfetti()}
            {isLoading && (
              <Box
                mt={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="h6" style={{ marginRight: "10px" }}>
                  Next question coming up!
                </Typography>
                <Box width="100%" maxWidth="200px">
                  <Slider value={50} step={1} marks disabled />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Gamemode1;
