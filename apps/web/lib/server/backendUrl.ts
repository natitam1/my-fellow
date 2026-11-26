/**
 * Single source of truth for the upstream REST API base URL used by
 * Next.js server route handlers and server utilities.
 */
const DEFAULT_API_URL = "https://my-fellow-api.onrender.com/api";

export function getBackendApiUrl(): string {
  const raw =
    process.env.API_BASE_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL;
  return raw.replace(/\/+$/, "");
}
