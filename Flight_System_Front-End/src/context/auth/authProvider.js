import React, { useState, useEffect, useContext } from "react";
import AuthContext from "./authContext";
import API from "../../services/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
  try {
    await API.post("/user/logout");
  } catch {}
  localStorage.clear();
  setUser(null);
  setAccessToken(null);
  setIsAuthenticated(false);
};

  useEffect(() => {
   
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider  value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        isAuthenticated,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
