// frontend/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://social-app-backend-efhv.onrender.com/api",
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;