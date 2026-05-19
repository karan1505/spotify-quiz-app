import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CardMedia,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import config from "../config";
import { CURATED_QUIZZES } from "./quizConfig";
import BackButton from "../components/BackButton";

const DEFAULT_BACKGROUND =
  "https://i.pinimg.com/736x/f5/8b/f2/f58bf2768a6d836a1a77c27ad450cbe4.jpg";

const Quiz = () => {
  const { quizId } = useParams();
  const curatedConfig = CURATED_QUIZZES[quizId];

  const playlistID = curatedConfig ? curatedConfig.playlistID : quizId;
  const title = curatedConfig ? curatedConfig.title : "Custom Quiz";
  const scoreboardName = curatedConfig ? curatedConfig.scoreboardName : "Custom Quiz";
  const backgroundImage = curatedConfig
    ? curatedConfig.backgroundImage
    : DEFAULT_BACKGROUND;
  const descriptionCards = curatedConfig
    ? curatedConfig.descriptionCards
    : [
        "This is a custom quiz based off of your playlist.",
        "You get a limited amount of time to guess the track",
        "We hope you have fun!",
      ];

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOptionFeedback, setSelectedOptionFeedback] = useState(null);
  const [showNextQuestionDialog, setShowNextQuestionDialog] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const pendingTimeouts = useRef(0);
  const [difficulty, setDifficulty] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "warning" });

  useEffect(() => {
    const fetchGamemode1 = async () => {
      try {
        const response = await axios.post(
          `${config.BASE_URL}/fetch_gamemode1`,
          { playlistID }
        );
        setQuestions(response.data.questions);
      } catch {
        setSnackbar({ open: true, message: "Failed to load quiz questions. Please try again.", severity: "error" });
      }
    };
    fetchGamemode1();
  }, [playlistID]);

  const handleTimeout = useCallback(() => {
    pendingTimeouts.current += 1;

    if (pendingTimeouts.current > 1) {
      return;
    }

    const processTimeout = () => {
      clearInterval(timerRef.current);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setCurrentQuestionIndex((prevIndex) => {
        const nextQuestionIndex = prevIndex + 1;

        if (nextQuestionIndex < questions.length) {
          setShowNextQuestionDialog(true);

          setTimeout(() => {
            setShowNextQuestionDialog(false);
            resetTimer();

            pendingTimeouts.current -= 1;
            if (pendingTimeouts.current > 0) {
              processTimeout();
            }
          }, 1500);
        } else {
          setShowResults(true);
          pendingTimeouts.current = 0;
        }

        return nextQuestionIndex;
      });
    };

    processTimeout();
  }, [questions.length]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    const initialTime =
      difficulty === "Easy" ? 30 : difficulty === "Medium" ? 15 : 5;
    setTimeLeft(initialTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [difficulty, handleTimeout]);

  useEffect(() => {
    if (quizStarted && currentQuestionIndex < questions.length) {
      const audioUrl = questions[currentQuestionIndex]?.audio_preview_url;

      if (audioRef.current && audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(() => {});
      }
      resetTimer();
    }

    return () => {
      clearInterval(timerRef.current);
      const currentAudioRef = audioRef.current;
      if (currentAudioRef) {
        currentAudioRef.pause();
        currentAudioRef.currentTime = 0;
      }
    };
  }, [quizStarted, currentQuestionIndex, questions, resetTimer]);

  useEffect(() => {
    if (showResults) {
      const saveScore = async () => {
        try {
          const userInfo = await axios.get(`${config.BASE_URL}/user_info`);
          const { id: spotifyId, display_name: userName } =
            userInfo.data.user_info;

          await axios.post(`${config.BASE_URL}/save_score`, {
            spotify_id: spotifyId,
            user_name: userName,
            quiz_name: scoreboardName,
            score: score,
          });
        } catch {
          setSnackbar({ open: true, message: "Failed to save your score.", severity: "error" });
        }
      };

      saveScore();
    }
  }, [showResults, score, scoreboardName]);

  const handleAnswerClick = (option) => {
    if (isLoading) return;
    setIsLoading(true);
    clearInterval(timerRef.current);

    const currentQuestion = questions[currentQuestionIndex];
    const is_correct = currentQuestion.correct_option.name === option.name;

    setSelectedOptionFeedback({ option, isCorrect: is_correct });
    if (is_correct) setScore((prev) => prev + 1);

    const nextQuestionIndex = currentQuestionIndex + 1;
    setTimeout(() => {
      setShowNextQuestionDialog(true);
      setTimeout(() => {
        setShowNextQuestionDialog(false);
        if (nextQuestionIndex < questions.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          setShowResults(true);
        }
      }, 2000);
      setSelectedOptionFeedback(null);
      setIsLoading(false);
    }, 2000);
  };

  const handleStartQuiz = () => {
    if (!difficulty) {
      setSnackbar({ open: true, message: "Please select a difficulty level before starting the quiz.", severity: "warning" });
      return;
    }
    setQuizStarted(true);
  };

  const renderConfetti = () =>
    selectedOptionFeedback?.isCorrect && (
      <Confetti width={window.innerWidth} height={window.innerHeight} />
    );

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
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <BackButton />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url("${backgroundImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px)",
            zIndex: -1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: -1,
          }}
        />
        <Container>
          <Typography
            variant="h3"
            gutterBottom
            textAlign="center"
            sx={{
              fontWeight: "bold",
              color: "#fff",
              textShadow: "0 4px 6px rgba(0, 0, 0, 0.6)",
            }}
          >
            {title}
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {descriptionCards.map((content, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card
                  sx={{
                    textAlign: "center",
                    padding: "20px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "12px",
                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 500, color: "text.primary" }}
                    >
                      {content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box textAlign="center" mt={4}>
            <Typography
              variant="h5"
              mb={2}
              sx={{
                fontWeight: "bold",
                color: "#fff",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
              }}
            >
              Select Difficulty Level
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {["Easy", "Medium", "Hard"].map((level, index) => (
                <Grid item key={index}>
                  <Card
                    onClick={() => setDifficulty(level)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        difficulty === level
                          ? "success.main"
                          : "rgba(255, 255, 255, 0.9)",
                      color: difficulty === level ? "#fff" : "text.primary",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                      },
                      padding: "10px",
                      textAlign: "center",
                      borderRadius: "12px",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {level}
                      </Typography>
                      <Typography>
                        Timer:{" "}
                        {level === "Easy"
                          ? "30s"
                          : level === "Medium"
                          ? "15s"
                          : "5s"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button
                variant="contained"
                onClick={handleStartQuiz}
                sx={{
                  mt: 3,
                  backgroundColor: "success.main",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
                  "&:hover": { backgroundColor: "success.dark" },
                }}
              >
                Start Quiz
              </Button>
            </motion.div>
          </Box>
        </Container>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  if (showResults) {
    return (
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <BackButton />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url("${backgroundImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px)",
            zIndex: -1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: -1,
          }}
        />
        <Card
          sx={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.4)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              textShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            Quiz Completed!
          </Typography>
          <Typography
            variant="h5"
            mt={2}
            sx={{
              color: "success.main",
              fontWeight: "bold",
            }}
          >
            Your Score: {score} / {questions.length}
          </Typography>
        </Card>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <BackButton />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url("${backgroundImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px)",
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: -1,
        }}
      />
      <Container maxWidth="lg">
        <Card
          sx={{
            padding: "20px",
            marginBottom: "20px",
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.4)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              textShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            Track {currentQuestionIndex + 1} / {questions.length}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "success.main",
              fontWeight: "bold",
            }}
          >
            Time Left: {timeLeft}s
          </Typography>
        </Card>
        <audio
          ref={audioRef}
          preload="auto"
          controls
          style={{ display: "none" }}
        />
        <Grid container spacing={2} justifyContent="center">
          {currentQuestion.options.map((option, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card
                  onClick={() => handleAnswerClick(option)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedOptionFeedback?.option === option
                        ? selectedOptionFeedback.isCorrect
                          ? "success.main"
                          : "error.main"
                        : "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={option.album_cover}
                    alt={option.name}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 500,
                        fontSize: "15px",
                        color: "text.primary",
                      }}
                    >
                      {option.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.hint",
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
      </Container>
      <Dialog
        open={showNextQuestionDialog}
        PaperProps={{ style: { borderRadius: "15px" } }}
      >
        <DialogTitle
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Next Song!
        </DialogTitle>
        <DialogContent style={{ textAlign: "center" }}>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "success.main",
              }}
            >
              Loading..
            </Typography>
          </motion.div>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Quiz;
