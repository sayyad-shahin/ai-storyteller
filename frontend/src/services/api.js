import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s — model inference can be slow
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";
    return Promise.reject({ ...error, message });
  }
);

export const generateStory = (payload) =>
  apiClient.post("/generate-story", payload);

export const getGenres = () => apiClient.get("/genres");
export const getTones  = () => apiClient.get("/tones");