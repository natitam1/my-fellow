import { NextResponse } from "next/server";
import { donations, registrations, users, events } from "@/lib/data";

export async function GET() {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalRevenue = donations.reduce((sum, d) => sum + d.amount, 0);
  const transactions = donations.length;
  const registrationsCount = registrations.length;
  const usersCount = users.length;
  const eventsCount = events.length;

  const pendingTransactionsCount = donations.filter(
    (d) => d.status === "pending",
  ).length;

  // Calculate increases in the past week
  const userIncrease = users.filter(
    (u) => new Date(u.createdAt) > oneWeekAgo,
  ).length;

  const transactionIncrease = donations.filter(
    (d) => new Date(d.createdAt) > oneWeekAgo,
  ).length;

  const revenueIncrease = donations
    .filter((d) => new Date(d.createdAt) > oneWeekAgo)
    .reduce((sum, d) => sum + d.amount, 0);

  const registrationIncrease = registrations.filter(
    (r) => new Date(r.createdAt) > oneWeekAgo,
  ).length;

  return NextResponse.json({
    users: usersCount,
    userIncrease,
    transactions,
    transactionIncrease,
    totalRevenue,
    revenueIncrease,
    registrations: registrationsCount,
    registrationIncrease,
    events: eventsCount,
    pendingTransactions: pendingTransactionsCount,
  });
}
