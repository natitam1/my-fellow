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

  // Total amount in ETB (all givings: pending + success) for dashboard display
  const totalRevenue = donations.reduce((sum, t) => sum + t.amount, 0);
  const pendingTransactions = donations.filter(
    (t) => t.status === "pending",
  ).length;

  return NextResponse.json({
    success: true,
    data: {
      users: users.length,
      userIncrease: 0,
      events: events.length,
      registrations: registrations.length,
      registrationIncrease: 0,
      transactions: donations.length,
      transactionIncrease: 0,
      totalRevenue,
      revenueIncrease: 0,
      pendingTransactions,
    },
  });
}
