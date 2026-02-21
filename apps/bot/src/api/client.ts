import axios, { AxiosInstance } from "axios";
import { config } from "../config";

/**
 * Creates an axios instance pointing at the My Fellow API.
 * Pass a JWT token to get an authenticated client.
 */
export function createApiClient(token?: string): AxiosInstance {
  const client = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 30_000,
  });

  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return client;
}

/** Shared unauthenticated client for public endpoints */
export const publicApi = createApiClient();
