import axios from "axios";

const api = axios.create({
  // Preporuka: bez "/api" ovde, jer tvoji pozivi već koriste '/api/...'
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  // Ako koristiš Vite umesto CRA, onda:
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;