import { API_URL } from "@/constants";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 59000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token: string | null = await SecureStore.getItemAsync("userToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      config.data instanceof FormData ||
      (Boolean(config.data) &&
        typeof config.data === "object" &&
        typeof (config.data as any).append === "function");

    if (isFormData) {
      if (typeof config.headers?.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      }
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }

    return config;
  },
  (error: unknown): Promise<never> => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.code === "ECONNABORTED" && !originalRequest._retry) {
      originalRequest._retry = true;
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;
