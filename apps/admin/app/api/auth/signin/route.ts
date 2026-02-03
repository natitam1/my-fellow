import { NextResponse } from "next/server";

export async function POST() {
  // Dev-only mock successful signin that issues a JWT-shaped token.
  // NOTE: This token is NOT cryptographically signed; it's only for local mock auth.
  const header = { alg: "none", typ: "JWT" };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "mock-admin-id",
    phoneNumber: "0912345678",
    role: "admin",
    exp: nowSeconds + 7 * 24 * 60 * 60, // 7 days
  };

  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const token = `${b64url(header)}.${b64url(payload)}.dev`;

  return NextResponse.json({
    success: true,
    token,
    user: {
      _id: payload.sub,
      fullName: "Admin User",
      role: payload.role,
      phoneNumber: payload.phoneNumber,
    },
  });
}
