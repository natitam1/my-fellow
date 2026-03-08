import { NextRequest } from "next/server";

type JwtPayload = {
  sub?: string;
  phoneNumber?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
};

function base64UrlDecodeToString(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return Buffer.from(padded, "base64").toString("utf8");
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecodeToString(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: NextRequest) {
  const auth =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function requireAdmin(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return {
      ok: false as const,
      status: 401 as const,
      message: "Unauthorized",
    };
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return {
      ok: false as const,
      status: 401 as const,
      message: "Invalid or expired token",
    };
  }

  if (typeof payload.exp === "number") {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowSeconds) {
      return {
        ok: false as const,
        status: 401 as const,
        message: "Invalid or expired token",
      };
    }
  }

  if (payload.role !== "admin") {
    return {
      ok: false as const,
      status: 403 as const,
      message: "Forbidden: Only the authorized owner can perform this action",
    };
  }

  return { ok: true as const, payload };
}
