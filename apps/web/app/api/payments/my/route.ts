import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

export async function GET(req: NextRequest) {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const apiUrl = getBackendApiUrl();

  try {
    const res = await fetch(`${apiUrl}/payments/my-givings`, {
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
          ? "Givings retrieved."
          : "Failed to load giving history.",
      },
      { status: res.status },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach payments service.";
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}
