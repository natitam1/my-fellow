import { NextResponse } from "next/server";

export async function POST() {
  // Mock successful signin
  return NextResponse.json({
    token: "mock-jwt-token-" + Date.now(),
    user: {
      _id: "mock-admin-id",
      fullName: "Admin User",
      role: "admin",
      phoneNumber: "0912345678",
    },
  });
}
