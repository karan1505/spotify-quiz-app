import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
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
  Link,
} from "@mui/material";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import config from "../config";

const ArtistQuiz2 = () => {
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
  const pendingTimeouts = useRef(0); // Declare at the top level
  const [difficulty, setDifficulty] = useState(null);
  const [playlistID] = useState("4TzXhSlf3vy4XZCepQkx99");

  useEffect(() => {
    const fetchGamemode1 = async () => {
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.post(
          `${config.BASE_URL}/fetch_gamemode1`,
          { playlistID }
        );
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Failed to fetch gamemode1 data:", error);
      }
    };
    fetchGamemode1();
  }, [playlistID]);

  const handleTimeout = useCallback(() => {
    pendingTimeouts.current += 1; // Increment the number of pending timeouts

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
        audioRef.current
          .play()
          .catch((error) => console.error("Audio play failed:", error));
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

  const handleAnswerClick = async (option) => {
    if (isLoading) return;
    setIsLoading(true);
    clearInterval(timerRef.current);

    const currentQuestion = questions[currentQuestionIndex];
    try {
      const response = await axios.post(`${config.BASE_URL}/validate_answer`, {
        question_id: currentQuestion.question_id,
        selected_option: option,
      });

      const { is_correct } = response.data;
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
    } catch (error) {
      console.error("Error validating answer:", error);
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!difficulty) {
      alert("Please select a difficulty level before starting the quiz.");
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
        {/* Background image with blur */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(
              "https://images3.alphacoders.com/151/151767.jpg"
            )`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px)",
            zIndex: -1,
          }}
        />
        {/* Semi-transparent overlay for better contrast */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark overlay
            zIndex: -1,
          }}
        />
        {/* Content */}
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
            This is Queen
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              "Did you know: Queen is one of the world's best-selling music artists, with record sales estimated at 250-300 million",
              "You get a limited amount of time to guess the track, and the time varies based on difficulty, good luck!",
              "Queen holds the record for the longest running rock group fan club in the world, how big of a fan are you?",
            ].map((content, idx) => (
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
                      sx={{ fontWeight: 500, color: "#333" }}
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
                          ? "#4caf50"
                          : "rgba(255, 255, 255, 0.9)",
                      color: difficulty === level ? "#fff" : "#333",
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
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
                  "&:hover": { backgroundColor: "#43a047" },
                }}
              >
                Start Quiz
              </Button>
            </motion.div>
          </Box>
        </Container>
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
        {/* Background image with blur */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(
              "https://images3.alphacoders.com/151/151767.jpg"
            )`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px)",
            zIndex: -1,
          }}
        />
        {/* Semi-transparent overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Darker overlay
            zIndex: -1,
          }}
        />
        {/* Result Card */}
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
              color: "#333",
              textShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            Quiz Completed!
          </Typography>
          <Typography
            variant="h5"
            mt={2}
            sx={{
              color: "#4caf50", // Highlighted score
              fontWeight: "bold",
            }}
          >
            Your Score: {score} / {questions.length}
          </Typography>
        </Card>
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
      {/* Background image with blur */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(
            "https://images3.alphacoders.com/151/151767.jpg"
          )`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px)",
          zIndex: -1,
        }}
      />
      {/* Semi-transparent overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Darker overlay
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
              color: "#333",
              textShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            Track {currentQuestionIndex + 1} / {questions.length}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#4caf50",
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
                          ? "#4caf50"
                          : "#f44336"
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
                        color: "#333",
                      }}
                    >
                      {option.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#555",
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
                color: "#4caf50",
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

export default ArtistQuiz2;
