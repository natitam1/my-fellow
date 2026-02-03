import { NextRequest, NextResponse } from "next/server";
import { events } from "@/lib/data";
import { requireAdmin } from "@/lib/server/adminAuth";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status },
    );
  }

  return NextResponse.json({ success: true, data: events });
}
