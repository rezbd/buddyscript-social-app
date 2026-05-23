import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
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