import { API_URL } from "@/constants";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { File as ExpoFileType } from "expo-file-system";
import * as SecureStore from "expo-secure-store";

/**
 * Decodes a base64 string into a Uint8Array without external dependencies.
 */
function decodeBase64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
  if (typeof globalThis.atob === "function") {
    const binary = globalThis.atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  let bufferLength = clean.length * 0.75;
  if (clean[clean.length - 1] === "=") {
    bufferLength--;
    if (clean[clean.length - 2] === "=") {
      bufferLength--;
    }
  }
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const encoded1 = lookup[clean.charCodeAt(i)];
    const encoded2 = lookup[clean.charCodeAt(i + 1)];
    const encoded3 = lookup[clean.charCodeAt(i + 2)];
    const encoded4 = lookup[clean.charCodeAt(i + 3)];
    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (p < bufferLength) bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  return bytes;
}

/**
 * Normalizes FormData file entries for Expo SDK 58's WinterCG `fetch` (`expo/fetch`) + `expo-file-system` `File`.
 * - If `entry` is already an `expo-file-system` `File` (or implements `.bytes()`), preserves it and wraps `.bytes()` with
 *   safe fallback for Expo Go Android percent-encoded cache paths (`%40` / `%2540`) and optional `base64`.
 * - If `entry` is a React Native `{ uri, name, type, base64? }` descriptor, converts it into an Expo SDK 58
 *   `File`-backed part with `.bytes()`.
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
        typeof entry.uri === "string"
      ) {
        const uri: string = entry.uri;
        const base64Data: string | undefined =
          typeof entry.base64 === "string" && entry.base64.length > 0
            ? entry.base64
            : undefined;
        const fallbackName = uri.split("/").pop() || "upload.jpg";
        const name =
          typeof entry.name === "string" && entry.name.trim().length > 0
            ? entry.name.trim()
            : fallbackName;
        const type =
          typeof entry.type === "string" && entry.type.trim().length > 0
            ? entry.type.trim()
            : "image/jpeg";

        const existingBytesFn =
          typeof entry.bytes === "function" ? entry.bytes.bind(entry) : null;

        pair[1] = {
          uri,
          name,
          type,
          bytes: async (): Promise<Uint8Array> => {
            if (base64Data) {
              return decodeBase64ToBytes(base64Data);
            }
            if (existingBytesFn) {
              try {
                return await existingBytesFn();
              } catch {
                // Fall through to File candidate resolution below
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { File } = require("expo-file-system") as {
              File: new (fileUri: string) => ExpoFileType;
            };
            const candidateUris = [
              uri,
              uri.replace(/%(?!25)/g, "%25"),
              decodeURIComponent(uri),
            ];
            let lastErr: unknown;
            for (const candidate of candidateUris) {
              try {
                const expoFile = new File(candidate);
                return await expoFile.bytes();
              } catch (err) {
                lastErr = err;
              }
            }
            throw lastErr;
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
