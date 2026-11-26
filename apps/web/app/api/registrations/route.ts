import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

function getAuthHeader(req: NextRequest): string | null {
  return (
    req.headers.get("authorization") || req.headers.get("Authorization") || null
  );
}

export async function POST(req: NextRequest) {
  const authHeader = getAuthHeader(req);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Authentication required to register." },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  if (!body.eventId || typeof body.eventId !== "string") {
    return NextResponse.json(
      { success: false, message: "Event ID is required" },
      { status: 400 },
    );
  }

  const apiUrl = getBackendApiUrl();

  try {
    const res = await fetch(`${apiUrl}/events/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data: unknown = await res.json().catch(() => null);
    if (data !== null) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(
      {
        success: res.ok,
        message: res.ok
          ? "Registration processed."
          : "Failed to process registration.",
      },
      { status: res.status },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach registration service.";
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest) {
  const authHeader = getAuthHeader(req);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const apiUrl = getBackendApiUrl();

  const targetUrl = eventId
    ? `${apiUrl}/events/registrations/${encodeURIComponent(eventId)}`
    : `${apiUrl}/events/registrations`;

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data: unknown = await res.json().catch(() => null);
    if (data !== null) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(
      {
        success: res.ok,
        message: res.ok
          ? "Registrations retrieved."
          : "Failed to retrieve registrations.",
      },
      { status: res.status },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach registration service.";
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}
