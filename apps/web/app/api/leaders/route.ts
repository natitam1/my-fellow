import { NextRequest, NextResponse } from "next/server";
import { FELLOWSHIP_LEADERS } from "@/lib/directory-data";

const apiUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://my-fellow-api.onrender.com/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  try {
    const backendUrl = new URL(`${apiUrl}/leaders`);
    if (type) backendUrl.searchParams.set("type", type);
    if (search) backendUrl.searchParams.set("search", search);

    const res = await fetch(backendUrl.toString(), {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Backend offline, fallback to curated leaders roster
  }

  let filtered = [...FELLOWSHIP_LEADERS];
  if (type && type !== "all") {
    filtered = filtered.filter((l) => l.category === type);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.role.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}
