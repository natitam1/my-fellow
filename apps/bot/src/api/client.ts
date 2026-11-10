import axios, { AxiosInstance } from "axios";
import { config } from "../config";
export function createApiClient(token?: string): AxiosInstance {
    const client = axios.create({
        baseURL: config.API_BASE_URL,
        timeout: 30000,
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (token) {
        client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return client;
}
export const publicApi = createApiClient();
