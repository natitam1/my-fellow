import axios from "axios";
import { getToken, removeToken } from "./auth";

const API_URL: string = "https://my-fellow-api.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/signin"
      ) {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
