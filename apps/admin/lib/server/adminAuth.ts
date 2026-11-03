import { NextRequest } from "next/server";

export function getBearerToken(req: NextRequest) {
  const auth =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireAuth(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return {
      ok: false as const,
      status: 401 as const,
      message: "Unauthorized",
    };
  }

  const apiUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://my-fellow-api.onrender.com/api";
  try {
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ok: false as const,
        status: response.status === 401 ? 401 : 403,
        message: "Invalid or expired token",
      };
    }
    const body = (await response.json()) as { user?: Record<string, unknown> };
    if (!body.user) throw new Error("Missing authenticated user");
    return { ok: true as const, payload: body.user };
  } catch {
    return {
      ok: false as const,
      status: 503 as const,
      message: "Authentication service unavailable",
    };
  }
}

export async function requireAdmin(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth;

  if (!["admin", "super_admin", "leader"].includes(String(auth.payload.role))) {
    return {
      ok: false as const,
      status: 403 as const,
      message: "Forbidden: Only the authorized owner can perform this action",
    };
  }

  return auth;
}
