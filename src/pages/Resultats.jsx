import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import "./Resultats.css";

export default function Resultats() {
  const { username, bestScore } = useUser();
  const navigate = useNavigate();
  const location = useLocation();


  const scoreData = location.state;
  const score = scoreData?.score ?? bestScore;
  const total = scoreData?.total ?? 0;

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const ratio = useMemo(() => {
    if (!total) return 0;
    return Math.round((score / total) * 100);
  }, [score, total]);

  const mention = useMemo(() => {
    if (ratio >= 80) return { text: "Excellent ! 🏆", color: "#10b981" };
    if (ratio >= 60) return { text: "Bien joué ! 🎯", color: "#6366f1" };
    if (ratio >= 40) return { text: "Pas mal 👍", color: "#f59e0b" };
    return { text: "Encore un effort ! 💪", color: "#ef4444" };
  }, [ratio]);

  const grade = ratio >= 80 ? "A" : ratio >= 60 ? "B" : ratio >= 40 ? "C" : "D";
  const gradeColors = { A: "#10b981", B: "#6366f1", C: "#f59e0b", D: "#ef4444" };

  return (
    <div className="resultats-container">
      {/* ── En-tête ── */}
      <div className="resultats-header">
        <div className="resultats-brand">
          <span>⚡</span>
          <span>PolyQuiz</span>
        </div>
        <h1 className="resultats-title">Résultats</h1>
      </div>

      <div className="score-hero">
        <div className="score-ring">
          <svg viewBox="0 0 120 120" className="ring-svg">
            <circle cx="60" cy="60" r="50" className="ring-track" />
            <circle
              cx="60" cy="60" r="50"
              className="ring-fill"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={animated ? `${2 * Math.PI * 50 * (1 - ratio / 100)}` : `${2 * Math.PI * 50}`}
              style={{ stroke: gradeColors[grade] }}
            />
          </svg>
          <div className="score-inner">
            <span className="score-num" style={{ color: gradeColors[grade] }}>
              {score}
            </span>
            <span className="score-denom">/ {total}</span>
            <span className="score-grade" style={{ color: gradeColors[grade] }}>
              {grade}
            </span>
          </div>
        </div>
        <p className="score-mention" style={{ color: mention.color }}>
          {mention.text}
        </p>
      </div>

      <div className="resultats-card">
        <div className="result-row">
          <div className="result-icon">👤</div>
          <span className="result-label">Joueur</span>
          <span className="result-value">{username || "Anonyme"}</span>
        </div>

        <div className="result-row">
          <div className="result-icon">✅</div>
          <span className="result-label">Bonnes réponses</span>
          <span className="result-value accent">{score} / {total}</span>
        </div>

        <div className="result-row">
          <div className="result-icon">📊</div>
          <span className="result-label">Réussite</span>
          <span className="result-value accent">{ratio}%</span>
        </div>

    
        <div className="progress-section">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: animated ? `${ratio}%` : "0%",
                background: `linear-gradient(90deg, ${gradeColors[grade]}, ${gradeColors[grade]}99)`,
              }}
            />
          </div>
          <div className="progress-labels">
            <span>0%</span>
            <span style={{ color: gradeColors[grade], fontWeight: 700 }}>{ratio}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="resultats-actions">
        <button className="btn-replay" onClick={() => navigate("/quiz")}>
          <span>🔄</span>
          <span>Rejouer</span>
        </button>
        <button className="btn-home" onClick={() => navigate("/")}>
          <span>🏠</span>
          <span>Accueil</span>
        </button>
      </div>
    </div>
  );
}