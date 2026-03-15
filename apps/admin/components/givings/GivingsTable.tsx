"use client";

import React from "react";
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
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
}

interface GivingsTableProps {
  givings: Giving[];
  loading: boolean;
}

export default function GivingsTable({ givings, loading }: GivingsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#ff6719]/20 border-t-[#ff6719] rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">
            Syncing financial records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/30 border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                Contributor
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                Purpose & Ref
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                Amount
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                Status
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {givings.map((giving) => (
              <tr
                key={giving._id}
                className="group hover:bg-gray-50/50 transition-all duration-300"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 flex items-center justify-center text-[#ff6719] font-black text-sm border border-orange-100 group-hover:scale-110 transition-transform">
                      {giving.userId?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900 leading-none mb-1 group-hover:text-[#ff6719] transition-colors">
                        {giving.userId?.fullName || "Anonymous Guest"}
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold font-mono">
                        {giving.userId?.phoneNumber || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-700 capitalize">
                      {giving.reason || "General Offering"}
                    </div>
                    <div className="text-[10px] text-gray-300 font-medium font-mono">
                      {giving.tx_ref}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 tabular-nums">
                      {giving.amount.toLocaleString()}{" "}
                      <span className="text-[10px] text-gray-400 font-bold">
                        ETB
                      </span>
                    </span>
                    {giving.amount > 5000 && (
                      <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">
                        High Value
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all ${
                      giving.status === "success"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20"
                        : giving.status === "pending"
                          ? "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20"
                          : "bg-red-50 text-red-600 border-red-100 shadow-red-100/20"
                    }`}
                  >
                    {giving.status === "success" && <CheckCircle2 size={12} />}
                    {giving.status === "pending" && <Clock size={12} />}
                    {giving.status === "failed" && <XCircle size={12} />}
                    {giving.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold">
                    <Calendar size={13} className="text-gray-300" />
                    {format(new Date(giving.createdAt), "MMM dd, yyyy")}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {givings.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <DollarSign size={40} className="text-gray-200" />
            </div>
            <h3 className="text-gray-900 font-black text-xl mb-1">
              No Givings Found
            </h3>
            <p className="text-gray-400 text-sm font-medium max-w-xs">
              We couldn't find any financial records matching your current
              filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
