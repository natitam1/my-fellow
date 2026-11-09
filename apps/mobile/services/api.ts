import { API_URL } from "@/constants";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

/**
 * Custom fetch adapter for FormData requests in React Native.
 * React Native's XMLHttpRequest has documented issues with FormData file streaming on Android.
 * React Native's native fetch() correctly streams multipart form data without header or boundary conflicts.
 */
const reactNativeFetchAdapter = async (
  config: InternalAxiosRequestConfig,
): Promise<any> => {
  const token: string | null = await SecureStore.getItemAsync("userToken");
  const base = (
    config.baseURL ||
    API_URL ||
    "https://my-fellow-api.onrender.com/api"
  ).replace(/\/$/, "");
  const url = config.url?.startsWith("http")
    ? config.url
    : `${base}${config.url?.startsWith("/") ? "" : "/"}${config.url || ""}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.headers) {
    const rawHeaders =
      typeof (config.headers as any).toJSON === "function"
        ? (config.headers as any).toJSON()
        : config.headers;

    for (const [key, value] of Object.entries(rawHeaders)) {
      if (
        key.toLowerCase() !== "content-type" &&
        key.toLowerCase() !== "authorization" &&
        typeof value === "string"
      ) {
        headers[key] = value;
      }
    }
  }

  const res = await fetch(url, {
    method: config.method?.toUpperCase() || "POST",
    headers,
    body: config.data,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const error: any = new Error(
      json?.message ||
        json?.detail ||
        json?.error ||
        `Request failed with status ${res.status}`,
    );
    error.response = {
      status: res.status,
      statusText: res.statusText,
      data: json,
      headers: res.headers as any,
      config,
    };
    error.isAxiosError = true;
    throw error;
  }

  return {
    data: json,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers as any,
    config,
    request: {},
  };
};

/**
 * Universal multipart FormData upload utility that uses native fetch to guarantee
 * zero network-layer crashes on Android and iOS.
 */
export async function uploadFormData<T>(
  endpoint: string,
  formData: FormData,
  method: "POST" | "PUT" = "POST",
): Promise<T> {
  const token: string | null = await SecureStore.getItemAsync("userToken");
  const base = (
    api.defaults.baseURL ||
    API_URL ||
    "https://my-fellow-api.onrender.com/api"
  ).replace(/\/$/, "");
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: formData as any,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error: any = new Error(
      data?.message ||
        data?.detail ||
        data?.error ||
        `Upload failed with status ${res.status}`,
    );
    error.response = { status: res.status, data };
    error.isAxiosError = true;
    throw error;
  }

  return data as T;
}

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
      config.adapter = reactNativeFetchAdapter;
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
