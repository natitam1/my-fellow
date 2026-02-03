import { NextRequest, NextResponse } from "next/server";
import { donations, registrations, users, events } from "@/lib/data";
import { requireAdmin } from "@/lib/server/adminAuth";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status },
    );
  }

  const totalRevenue = donations
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);

  return NextResponse.json({
    success: true,
    data: {
      users: users.length,
      events: events.length,
      registrations: registrations.length,
      transactions: donations.length,
      totalRevenue,
    },
  });
}
