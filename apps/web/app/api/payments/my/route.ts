import { NextRequest, NextResponse } from "next/server";
import { MOCK_USER_GIVINGS } from "@/lib/directory-data";

const apiUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://my-fellow-api.onrender.com/api";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader) {
    try {
      // Backend payment route is /payments/my-givings
      const res = await fetch(`${apiUrl}/payments/my-givings`, {
        headers: {
          Authorization: authHeader,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        return NextResponse.json(json);
      }
    } catch {
      // Backend offline, fallback to mock data
    }
  }

  return NextResponse.json({
    success: true,
    count: MOCK_USER_GIVINGS.length,
    data: MOCK_USER_GIVINGS,
  });
}
