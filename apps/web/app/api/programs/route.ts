import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiUrl = getBackendApiUrl();

  const backendUrl = new URL(`${apiUrl}/programs`);
  searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  try {
    const res = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
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
        message: res.ok ? "Programs retrieved." : "Failed to load programs.",
      },
      { status: res.status },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach programs service.";
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}
