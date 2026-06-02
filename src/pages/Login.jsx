import { useUser } from "../context/UserContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const { setUsername } = useUser();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const pseudo = input.trim();
    if (!pseudo) {
      setError("Veuillez entrer un pseudo.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur de connexion");
      }

      const { token } = await res.json();
      localStorage.setItem("token", token);
      setUsername(pseudo);
      navigate("/quiz");
    } catch (err) {
      setError(err.message || "Serveur inaccessible. Vérifiez l'API.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="login-container">
      <div className="login-glow" />

      <div className="login-icon-wrap">
        <div className="login-icon">PQ</div>
      </div>

      <div className="login-title">PolyQuiz</div>
      <div className="login-divider" />
      <p className="login-subtitle">
        Testez vos connaissances avec des quiz chronométrés
      </p>

      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <div className="login-input-wrap">
          <span className="login-input-icon">👤</span>
          <input
            type="text"
            placeholder="Entrez votre pseudo"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyPress={handleKeyPress}
            autoFocus
            disabled={loading}
          />
        </div>

        {error && <div className="login-error">{error}</div>}

        <button onClick={handleSubmit} disabled={loading || !input.trim()}>
          {loading ? (
            <span className="btn-spinner" />
          ) : (
            <>
              <span>🚀</span>
              <span>Commencer le quiz</span>
            </>
          )}
        </button>
      </form>

      <div className="login-features">
        <div className="feature-item">
          <span>⏱️</span>
          <span>Chrono</span>
        </div>
        <div className="feature-item">
          <span>🎯</span>
          <span>Score</span>
        </div>
        <div className="feature-item">
          <span>🏆</span>
          <span>Classement</span>
        </div>
      </div>

      <p className="login-footer">© Mr Ross — All Rights Reserved</p>
    </div>
  );
}

export default Login;