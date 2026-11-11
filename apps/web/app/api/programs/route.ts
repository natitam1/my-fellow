import { NextRequest, NextResponse } from "next/server";
import { INITIAL_PROGRAMS, DayOfWeek } from "@/lib/programs-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day");
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase().trim();

  let results = [...INITIAL_PROGRAMS];

  if (day && day !== "all") {
    results = results.filter(
      (p) => p.day.toLowerCase() === day.toLowerCase()
    );
  }

  if (category && category !== "all") {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.location.name.toLowerCase().includes(search) ||
        p.leader.name.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    data: results,
  });
}
