import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

function getAuthHeader(req: NextRequest): string | null {
  return (
    req.headers.get("authorization") || req.headers.get("Authorization") || null
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authHeader = getAuthHeader(req);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Authentication required to register." },
      { status: 401 },
    );
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
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
      body: JSON.stringify({ ...body, eventId: id }),
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authHeader = getAuthHeader(req);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const apiUrl = getBackendApiUrl();

  try {
    const res = await fetch(
      `${apiUrl}/events/registrations/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const data: unknown = await res.json().catch(() => null);
    if (data !== null) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(
      {
        success: res.ok,
        message: res.ok
          ? "Registrations retrieved."
          : "Failed to retrieve event registrations.",
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
