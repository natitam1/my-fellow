import { NextRequest, NextResponse } from "next/server";
import { INITIAL_EVENTS, isEventPast, isEventUpcoming } from "@/lib/events-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // upcoming | past | all
  const team = searchParams.get("team");
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase().trim();

  let results = [...INITIAL_EVENTS];

  if (status === "upcoming") {
    results = results.filter((e) => !isEventPast(e.endDate));
  } else if (status === "past") {
    results = results.filter((e) => isEventPast(e.endDate));
  }

  if (team && team !== "all") {
    results = results.filter(
      (e) => e.team.toLowerCase() === team.toLowerCase()
    );
  }

  if (category && category !== "all") {
    results = results.filter(
      (e) => e.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(search) ||
        e.shortDescription.toLowerCase().includes(search) ||
        e.location.name.toLowerCase().includes(search) ||
        e.speakers.some((s) => s.name.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    data: results,
  });
}
