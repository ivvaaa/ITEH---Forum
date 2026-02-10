import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (process.env.NODE_ENV === "development") {
    const fullUrl = `${config.baseURL || ""}${config.url || ""}`;
    // eslint-disable-next-line no-console
    console.log("REQ", config.method?.toUpperCase(), fullUrl, "AUTH", !!config.headers.Authorization);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "development") {
      const cfg = error.config || {};
      const fullUrl = `${cfg.baseURL || ""}${cfg.url || ""}`;
      if (error.response?.status === 401) {
        // eslint-disable-next-line no-console
        console.log("RES 401", fullUrl, "AUTH", cfg.headers?.Authorization || null);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
