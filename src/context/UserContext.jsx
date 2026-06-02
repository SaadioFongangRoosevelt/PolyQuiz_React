/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

// Décode le payload du JWT sans librairie externe
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function UserProvider({ children }) {
  const [username, setUsername] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.pseudo || null;
  });

  const [bestScore, setBestScore] = useState(0);

  const logout = () => {
    localStorage.removeItem("token");
    setUsername(null);
    setBestScore(0);
  };

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        bestScore,
        setBestScore,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}