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
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import config from "./config";

// Gamemode1.js - Updated function
const Quiz1 = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOptionFeedback, setSelectedOptionFeedback] = useState(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const [difficulty, setDifficulty] = useState(null); // Default difficulty

  // New state for playlistID
  const [playlistID, setPlaylistID] = useState("2eeijnQ6uPptmB9BP9xClO"); // Default playlist ID

  // Fetch questions from the backend
  useEffect(() => {
    const fetchGamemode1 = async () => {
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.post(
          `${config.BASE_URL}/fetch_gamemode1`,
          {
            playlistID,
          }
        );
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Failed to fetch gamemode1 data:", error);
      }
    };
    fetchGamemode1();
  }, [playlistID]);

  // Rest of the component remains unchanged

  // Timer management
  useEffect(() => {
    if (quizStarted && !showResults) {
      resetTimer();
    }
    return () => clearInterval(timerRef.current); // Cleanup timer
  }, [quizStarted, currentQuestionIndex, showResults]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    const initialTime =
      difficulty === "Easy" ? 30 : difficulty === "Medium" ? 15 : 5;
    setTimeLeft(initialTime); // Set timer based on selected difficulty
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

  const handleStartQuiz = () => {
    if (!difficulty) {
      alert("Please select a difficulty level before starting the quiz.");
      return;
    }
    setQuizStarted(true);
  };

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
        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
          style={{ marginTop: "20px" }}
        >
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                cursor: "pointer",
                bgcolor: "#ffffff",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top 50 Global Song Quiz
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a5568" }}>
                  Choose one of the difficulties and select Start Quiz to begin!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
          style={{ marginTop: "20px" }}
        >
          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => {
                setDifficulty("Easy");
                setTimeLeft(30);
              }}
              sx={{
                cursor: "pointer",
                backgroundColor: difficulty === "Easy" ? "#4caf50" : "#ffffff",
                "&:hover": { backgroundColor: "#e0f7fa" },
                padding: "10px",
                textAlign: "center",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  Easy
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Timer: 30 seconds
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => {
                setDifficulty("Medium");
                setTimeLeft(15);
              }}
              sx={{
                cursor: "pointer",
                backgroundColor:
                  difficulty === "Medium" ? "#4caf50" : "#ffffff",
                "&:hover": { backgroundColor: "#e0f7fa" },
                padding: "10px",
                textAlign: "center",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  Medium
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Timer: 15 seconds
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => {
                setDifficulty("Hard");
                setTimeLeft(5);
              }}
              sx={{
                cursor: "pointer",
                backgroundColor: difficulty === "Hard" ? "#4caf50" : "#ffffff",
                "&:hover": { backgroundColor: "#e0f7fa" },
                padding: "10px",
                textAlign: "center",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  Hard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Timer: 5 seconds
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
    <Box
      minHeight="100vh"
      sx={{
        backgroundImage: `url(https://images.unsplash.com/photo-1460355976672-71c3f0a4bdac?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        py: 5,
      }}
    >
      <Container maxWidth="lg">
        <BackToDashboardButton />

        {/* Question Tracker */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            sx={{
              color: "#ffffff",
              fontWeight: 200,
              textAlign: "center",
            }}
          >
            Question {currentQuestionIndex + 1} of {questions.length} - Time
            Left: {timeLeft}s
          </Typography>
        </Box>

        {/* Question Card */}
        <Card
          sx={{
            mb: 4,
            backgroundColor: "#ffffff",
            boxShadow: 3,
            p: 3,
            display: "none",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {currentQuestion.question}
          </Typography>
          <audio
            ref={audioRef}
            src={currentQuestion.audio_preview_url}
            autoPlay
            onLoadedMetadata={() => {
              if (audioRef.current) audioRef.current.volume = volume;
            }}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              overflow: "hidden",
              visibility: "hidden",
              display: "none",
            }}
          />
        </Card>

        {/* Options */}
        <Grid
          container
          spacing={2} // Adjust spacing as needed
          justifyContent="center"
          alignItems="stretch"
        >
          {currentQuestion.options.map((option, index) => (
            <Grid
              item
              xs={12} // 4x1 on small screens
              sm={6} // 2x2 on medium screens
              md={3} // Always 2x2 on larger screens
              key={index}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  onClick={() => {
                    if (!isLoading) handleAnswerClick(option); // Ensure click only works if not loading
                  }}
                  sx={{
                    cursor: "pointer",
                    bgcolor:
                      selectedOptionFeedback?.option === option
                        ? selectedOptionFeedback.isCorrect
                          ? "#4caf50"
                          : "#f44336"
                        : "#ffffff",
                    boxShadow: 3,
                    transformOrigin: "center",
                    transform: "scale(1)",
                    transition: "transform 0.3s, background-color 0.3s",
                    "&:hover": { transform: "scale(0.85)" },
                    height: "100%", // Ensures consistent height for all cards
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={option.album_cover}
                    alt={option.name}
                    sx={{
                      objectFit: "cover",
                    }}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        textAlign: "center",
                        color:
                          selectedOptionFeedback?.option === option
                            ? "#ffffff"
                            : "#000000",
                      }}
                    >
                      {option.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "block",
                        textAlign: "center",
                        color:
                          selectedOptionFeedback?.option === option
                            ? "#e0e0e0"
                            : "#4a5568",
                      }}
                    >
                      {option.artist}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {renderConfetti()}

        {isLoading && (
          <Box
            mt={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              position: "relative",
              flexDirection: "column",
            }}
          >
            {/* Animated Text */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: "#ffffff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Next question coming up!
              </Typography>
            </motion.div>

            {/* Pulsing Circle Animation */}
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 0.4, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
              }}
              style={{
                width: "60px",
                height: "60px",
                marginTop: "20px",
                borderRadius: "50%",
                background: "linear-gradient(45deg, #f44336, #4caf50)",
              }}
            ></motion.div>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Quiz1;
