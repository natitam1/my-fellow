import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiUrl = getBackendApiUrl();

  const backendUrl = new URL(`${apiUrl}/events`);
  searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    const res = await fetch(backendUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data: unknown = await res.json().catch(() => null);
    if (data !== null) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(
      {
        success: res.ok,
        message: res.ok ? "Events retrieved." : "Failed to load events.",
      },
      { status: res.status },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to reach events service.";
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}
