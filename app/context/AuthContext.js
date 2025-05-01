"use client";

import API from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Adding a loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      getUserInfo(token);
    } else {
      setLoading(false); // Set loading to false if no token exists
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
      setLoading(true); // Set loading true while fetching user info
      const response = await API.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data); // Store user info in state
      setLoading(false); // Set loading to false once user info is fetched
    } catch (error) {
      console.error("Failed to retrieve user info", error);
      setUserInfo(null); // Reset user info if error occurs
      setLoading(false); // Set loading to false even on error
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userInfo, getUserInfo, loading }}>
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
