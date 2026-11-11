import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/events-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: event,
  });
}
