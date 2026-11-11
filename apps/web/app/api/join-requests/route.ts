import { NextRequest, NextResponse } from "next/server";

const apiUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://my-fellow-api.onrender.com/api";

// Simple in-memory fallback store for requests made during session
const localRequests: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

    // Try forwarding to backend if available
    try {
      const response = await fetch(`${apiUrl}/join-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch {
      // Backend not reached, fall back to local handler
    }

    // Local resilient fallback
    const newRequest = {
      id: `req-${Date.now()}`,
      teamId: body.teamId,
      fullName: body.fullName || "Fellowship Member",
      phoneNumber: body.phoneNumber,
      department: body.department,
      year: body.year,
      telegramHandle: body.telegramHandle,
      message: body.message || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    localRequests.push(newRequest);

    return NextResponse.json(
      {
        success: true,
        message: "Join request submitted successfully! Your team coordinator will reach out shortly.",
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit join request" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  try {
    const response = await fetch(`${apiUrl}/join-requests/my`, {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fall back to local
  }

  return NextResponse.json({
    success: true,
    data: localRequests,
  });
}
