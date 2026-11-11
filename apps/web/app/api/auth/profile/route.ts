import { NextRequest, NextResponse } from "next/server";

const apiUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://my-fellow-api.onrender.com/api";

async function forwardProfileUpdate(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const contentType = req.headers.get("content-type") || "";

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    let body: any;
    if (contentType.includes("application/json")) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(await req.json());
    } else {
      // Pass along binary / form data if available
      body = await req.arrayBuffer();
      if (contentType) {
        headers["Content-Type"] = contentType;
      }
    }

    const response = await fetch(`${apiUrl}/auth/profile`, {
      method: "PATCH",
      headers,
      body,
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return forwardProfileUpdate(req);
}

export async function PUT(req: NextRequest) {
  return forwardProfileUpdate(req);
}

export async function PATCH(req: NextRequest) {
  return forwardProfileUpdate(req);
}
