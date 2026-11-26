import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

export async function POST(req: NextRequest) {
  const apiUrl = getBackendApiUrl();
  const response = await fetch(`${apiUrl}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await req.json()),
    cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
