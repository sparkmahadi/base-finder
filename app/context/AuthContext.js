"use client";

import API from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      getUserInfo(token);
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserInfo(null); // Reset user info on logout
  };

  const getUserInfo = async (token) => {
    try {
      const response = await API.get("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data); // Store user info in state
    } catch (error) {
      console.error("Failed to retrieve user info", error);
      setUserInfo(null); // Reset user info if error occurs
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userInfo, getUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
