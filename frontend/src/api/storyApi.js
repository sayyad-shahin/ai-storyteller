import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

const client = axios.create({
  baseURL: BASE,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.detail || err.message || "Unexpected error";
    return Promise.reject({ ...err, message: msg });
  }
);

export const generateStory = payload => client.post("/generate-story", payload);