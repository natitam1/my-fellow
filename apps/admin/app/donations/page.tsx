"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Loader2,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface Transaction {
  _id: string;
  user: {
    fullName: string;
    phoneNumber: string;
  };
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export default function DonationsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/transactions");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setError("Unable to load transaction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalAmount = transactions.reduce(
    (sum, t) =>
      sum + (t.status === "pending" || t.status === "completed" ? t.amount : 0),
    0,
  );
  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#ff6719] w-10 h-10" />
        <p className="mt-4 text-gray-500">Retrieving donation records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Donations & Giving
          </h1>
          <p className="text-gray-500 mt-1">
            Track communal giving and financial contributions.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[200px]">
            <div className="bg-emerald-50 p-2.5 rounded-xl">
              <TrendingUp className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Total Revenue
              </p>
              <p className="text-xl font-black text-gray-900">
                {totalAmount.toLocaleString()}{" "}
                <span className="text-xs font-normal">ETB</span>
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[200px]">
            <div className="bg-orange-50 p-2.5 rounded-xl">
              <Clock className="text-[#ff6719] w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Pending Sum
              </p>
              <p className="text-xl font-black text-gray-900">
                {pendingAmount.toLocaleString()}{" "}
                <span className="text-xs font-normal">ETB</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl shadow-gray-100/50 overflow-hidden border border-gray-100 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Contributor
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr
                  key={tx._id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        {tx.user?.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">
                          {tx.user?.fullName || "System Guest"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tx.user?.phoneNumber || "No contact"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-gray-900 flex items-center gap-1">
                      {tx.amount.toLocaleString()}{" "}
                      <span className="text-[10px] text-gray-400">ETB</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize shadow-sm border ${
                        tx.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : tx.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          tx.status === "completed"
                            ? "bg-emerald-500"
                            : tx.status === "pending"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                      />
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded inline-block uppercase">
                      {tx.paymentMethod || "Digital"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-gray-400" />
                      {formatDate(tx.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <DollarSign size={40} className="text-gray-200 mb-2" />
                      <p className="font-medium text-gray-400 text-lg">
                        No transactions found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Giving records will appear here once initiated.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
