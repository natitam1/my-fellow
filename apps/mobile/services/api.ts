import { API_URL } from "@/constants";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { File as ExpoFileType } from "expo-file-system";
import * as SecureStore from "expo-secure-store";

/**
 * Normalizes legacy React Native `{ uri, name, type }` FormData file entries
 * into Expo SDK 58 WinterCG-compatible parts with a `.bytes()` reader backed by `expo-file-system`.
 */
export function prepareFormDataForExpoFetch(formData: FormData): FormData {
  const parts = (formData as any)?._parts;
  if (Array.isArray(parts)) {
    for (let i = 0; i < parts.length; i++) {
      const pair = parts[i];
      if (!Array.isArray(pair) || pair.length < 2) continue;
      const entry = pair[1];
      if (
        entry &&
        typeof entry === "object" &&
        "uri" in entry &&
        typeof entry.uri === "string" &&
        typeof entry.bytes !== "function"
      ) {
        const uri: string = entry.uri;
        const fallbackName = uri.split("/").pop() || "upload.jpg";
        const name =
          typeof entry.name === "string" && entry.name.trim().length > 0
            ? entry.name.trim()
            : fallbackName;
        const type =
          typeof entry.type === "string" && entry.type.trim().length > 0
            ? entry.type.trim()
            : "image/jpeg";

        pair[1] = {
          uri,
          name,
          type,
          bytes: async (): Promise<Uint8Array> => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { File } = require("expo-file-system") as {
              File: new (fileUri: string) => ExpoFileType;
            };
            const expoFile = new File(uri);
            return await expoFile.bytes();
          },
        };
      }
    }
  }
  return formData;
}

/**
 * Custom fetch adapter for FormData requests in Expo SDK 58 / React Native.
 * Uses Expo's WinterCG fetch with `expo-file-system` File `.bytes()` streaming.
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

  const body =
    config.data instanceof FormData ||
    (config.data && typeof config.data === "object" && "_parts" in config.data)
      ? prepareFormDataForExpoFetch(config.data as FormData)
      : config.data;

  const res = await fetch(url, {
    method: config.method?.toUpperCase() || "POST",
    headers,
    body: body as any,
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
 * Universal multipart FormData upload utility for Expo SDK 58.
 * Converts any `{ uri, name, type }` file parts to `expo-file-system` File `.bytes()` parts
 * so Expo's WinterCG `convertFormDataAsync` serializes the multipart payload cleanly.
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

  const preparedFormData = prepareFormDataForExpoFetch(formData);

  const res = await fetch(url, {
    method,
    headers,
    body: preparedFormData as any,
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
      config.transformRequest = [(data: any) => data];
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
