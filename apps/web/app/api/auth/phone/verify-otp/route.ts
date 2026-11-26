import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

export async function POST(req: NextRequest) {
  const apiUrl = getBackendApiUrl();

  try {
    const body = await req.json();
    const response = await fetch(`${apiUrl}/auth/phone/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
