"use client";

import React from "react";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Giving {
  _id: string;
  userId: {
    fullName: string;
    phoneNumber: string;
  };
  amount: number;
  status: string;
  reason: string;
  createdAt: string;
  tx_ref: string;
  method: string;
  event?: {
    title: string;
  };
}

interface GivingsTableProps {
  transactions: Giving[];
  loading: boolean;
}

export default function GivingsTable({
  transactions,
  loading,
}: GivingsTableProps) {
  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium">
          Syncing financial records...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Giver
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Amount (ETB)
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr
                key={tx._id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm border border-emerald-100/50 uppercase">
                      {tx.userId?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                        {tx.userId?.fullName || "Anonymous"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {tx.userId?.phoneNumber || "No Phone"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">
                    {tx.event?.title || tx.reason || "Direct Giving"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {tx.amount?.toLocaleString() || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-tight">
                    {tx.tx_ref || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium font-mono">
                  {format(new Date(tx.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === "confirmed" || tx.status === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : tx.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {tx.status || "pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <DollarSign size={40} className="text-gray-200" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">
              No Transactions Found
            </h3>
            <p className="text-gray-400 text-sm font-medium max-w-xs">
              We couldn't find any financial records matching your current
              filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
