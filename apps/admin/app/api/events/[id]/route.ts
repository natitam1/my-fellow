import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ success: true, message: "Event updated (mock)" });
}

export async function DELETE() {
  return NextResponse.json({ success: true, message: "Event deleted (mock)" });
}
