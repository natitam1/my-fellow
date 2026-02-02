import { NextResponse } from "next/server";
import { donations, registrations } from "@/lib/data";

export async function GET() {
  const totalRevenue = donations.reduce((sum, d) => sum + d.amount, 0);
  const transactions = donations.length;
  const registrationsCount = registrations.length;

  return NextResponse.json({
    transactions,
    totalRevenue,
    registrationsCount,
    // Add other stats if needed
  });
}
