// /lib/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Your backend URL
});

// Add token automatically if available
API.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
