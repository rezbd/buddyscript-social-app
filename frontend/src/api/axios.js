// frontend/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://social-app-backend-efhv.onrender.com/api",
  timeout: 15000, // 15 second timeout
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  // Always read fresh from localStorage
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    if (error.response) {
      console.error("[API Error]", error.config?.url, error.response?.status, error.response?.data);
    } else if (error.request) {
      console.error("[API Error] No response received:", error.config?.url, error.message);
    } else {
      console.error("[API Error]", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;