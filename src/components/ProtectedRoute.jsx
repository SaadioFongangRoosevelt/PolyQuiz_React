import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function ProtectedRoute({ children }) {
  const { username } = useUser();
  // Vérifie soit le contexte, soit le token JWT (persistance après refresh)
  const token = localStorage.getItem("token");

  if (!username && !token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;