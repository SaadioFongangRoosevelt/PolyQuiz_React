import { useReducer, useEffect, useRef, useState } from "react";
import { quizReducer } from "../reducers/quizReducer";
import useFetch from "../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./QuizEngine.css";

const TOTAL_TIME = 60;
const LETTERS = ["A", "B", "C", "D"];

const initialState = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  status: "loading",
  timeLeft: TOTAL_TIME,
};

function QuizEngine() {
  const { data, loading, error } = useFetch("http://localhost:5000/api/questions");
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const navigate = useNavigate();
  const { setBestScore } = useUser();
  const timerRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Charger les questions depuis l'API
  useEffect(() => {
    if (data && data.length > 0) {
      dispatch({ type: "START_QUIZ", payload: data });
    }
  }, [data]);

  // Gérer le timer
  useEffect(() => {
    if (state.status !== "playing") return;
    if (state.timeLeft <= 0) {
      clearInterval(timerRef.current);
      dispatch({ type: "FINISH_QUIZ" });
      return;
    }
    timerRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(timerRef.current);
  }, [state.status, state.timeLeft]);

  // Fin de quiz quand toutes les questions sont répondues
  useEffect(() => {
    if (
      state.status === "playing" &&
      state.questions.length > 0 &&
      state.currentQuestionIndex >= state.questions.length
    ) {
      clearInterval(timerRef.current);
      dispatch({ type: "FINISH_QUIZ" });
    }
  }, [state.currentQuestionIndex, state.status, state.questions.length]);

  // Naviguer vers résultats et envoyer le score
  useEffect(() => {
    if (state.status !== "finished") return;

    const sendScore = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        await fetch("http://localhost:5000/api/users/score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ score: state.score }),
        });
      } catch (err) {
        console.error("Erreur envoi du score:", err);
      }
    };

    sendScore();
    setBestScore(state.score);
    navigate("/resultats", { state: { score: state.score, total: state.questions.length } });
  }, [state.status]);

  const handleAnswer = (opt, idx) => {
    if (isTransitioning || selectedIndex !== null) return;
    setSelectedIndex(idx);
    setIsTransitioning(true);
    setTimeout(() => {
      dispatch({ type: "ANSWER_QUESTION", payload: opt });
      setSelectedIndex(null);
      setIsTransitioning(false);
    }, 400);
  };

  if (loading) return (
    <div className="quiz-loading">
      <div className="loading-spinner" />
      <p>Chargement des questions…</p>
    </div>
  );

  if (error) return (
    <div className="quiz-error">
      <div className="error-icon">⚠️</div>
      <p>Impossible de charger les questions.</p>
      <small>Vérifiez que le serveur API est démarré sur le port 5000.</small>
      <button onClick={() => window.location.reload()}>Réessayer</button>
    </div>
  );

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const timerPercent = (state.timeLeft / TOTAL_TIME) * 100;
  const timerClass = state.timeLeft < 5 ? "critical" : state.timeLeft < 10 ? "warning" : "";
  const progressPercent = state.questions.length > 0
    ? ((state.currentQuestionIndex) / state.questions.length) * 100
    : 0;

  return (
    <div className="quiz-container">
      {/* ── En-tête ── */}
      <div className="quiz-header">
        <div className="quiz-brand">
          <span className="quiz-brand-icon">⚡</span>
          <span className="quiz-brand-name">PolyQuiz</span>
        </div>
        <div className="quiz-stats">
          <div className="stat-pill">
            <span className="stat-icon">📋</span>
            <span className="stat-val">{Math.min(state.currentQuestionIndex + 1, state.questions.length)}</span>
            <span className="stat-sep">/</span>
            <span className="stat-total">{state.questions.length}</span>
          </div>
          <div className="stat-pill score-pill">
            <span className="stat-icon">⭐</span>
            <span className="stat-val">{state.score}</span>
          </div>
        </div>
      </div>

      {/* ── Barre de progression globale ── */}
      <div className="global-progress">
        <div className="global-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* ── Timer ── */}
      <div className="timer-section">
        <div className={`timer-circle ${timerClass}`}>
          <svg viewBox="0 0 100 100" className="timer-svg">
            <circle cx="50" cy="50" r="42" className="timer-track" />
            <circle
              cx="50" cy="50" r="42"
              className={`timer-arc ${timerClass}`}
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - timerPercent / 100)}`}
            />
          </svg>
          <div className="timer-inner">
            <span className={`timer-digits ${timerClass}`}>{state.timeLeft}</span>
            <span className="timer-unit">sec</span>
          </div>
        </div>
      </div>

      {/* ── Question ── */}
      {state.status === "playing" && currentQuestion && (
        <div className="question-container">
          <div className="question-meta">
            <span className="category-badge">
              {currentQuestion.category || "Général"}
            </span>
            <span className="question-counter">
              Q{state.currentQuestionIndex + 1}
            </span>
          </div>

          <h2 className="question-text">
            {currentQuestion.text}
          </h2>

          <div className="options">
            {currentQuestion.options.map((opt, index) => (
              <button
                key={index}
                className={`option-button ${selectedIndex === index ? "selected" : ""}`}
                onClick={() => handleAnswer(opt, index)}
                disabled={isTransitioning}
              >
                <span className="option-letter">{LETTERS[index]}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizEngine;