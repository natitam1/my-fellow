"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  HeartHandshake,
  TrendingUp,
  Clock,
  Target,
  ArrowUpRight,
} from "lucide-react";
import GivingsFilter from "@/components/givings/GivingsFilter";
import GivingsTable from "@/components/givings/GivingsTable";

export default function GivingsPage() {
  const [givings, setGivings] = useState<any[]>([]);
  const [filteredGivings, setFilteredGivings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  const fetchGivings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/transactions");
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : response.data || [];
      setGivings(data);
      setFilteredGivings(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch givings", err);
      setError("Unable to retrieve records from the financial gateway.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGivings();
  }, [fetchGivings]);

  // Apply filters locally for real-time experience
  useEffect(() => {
    let result = [...givings];

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.userId?.fullName?.toLowerCase().includes(lowerSearch) ||
          g.userId?.phoneNumber?.includes(lowerSearch) ||
          g.tx_ref?.toLowerCase().includes(lowerSearch),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((g) => g.status === statusFilter);
    }

    if (amountFilter !== "all") {
      if (amountFilter === "0-1000")
        result = result.filter((g) => g.amount <= 1000);
      else if (amountFilter === "1000-5000")
        result = result.filter((g) => g.amount > 1000 && g.amount <= 5000);
      else if (amountFilter === "5000+")
        result = result.filter((g) => g.amount > 5000);
    }

    setFilteredGivings(result);
  }, [search, statusFilter, amountFilter, givings]);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setAmountFilter("all");
  };

  const totalSuccess = givings
    .filter((g) => g.status === "success")
    .reduce((sum, g) => sum + g.amount, 0);

  const pendingAmount = givings
    .filter((g) => g.status === "pending")
    .reduce((sum, g) => sum + g.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-50 text-[#ff6719] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100">
              Financial Records
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300" />
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Real-time Sync
            </div>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">
            Fellowship <span className="text-[#ff6719]">Givings</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            Manage communal contributions, track spiritual giving, and analyze
            financial flows with precision.
          </p>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <div className="flex-1 min-w-[200px] bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 group hover:border-emerald-100 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500">
                <TrendingUp size={24} />
              </div>
              <ArrowUpRight
                size={20}
                className="text-gray-200 group-hover:text-emerald-500 transition-colors"
              />
            </div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">
              Total Revenue
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tighter">
              {totalSuccess.toLocaleString()}{" "}
              <span className="text-xs font-bold text-gray-400">ETB</span>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 group hover:border-orange-100 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-50 p-3 rounded-2xl text-[#ff6719]">
                <Clock size={24} />
              </div>
              <ArrowUpRight
                size={20}
                className="text-gray-200 group-hover:text-[#ff6719] transition-colors"
              />
            </div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">
              Pending Gate
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tighter">
              {pendingAmount.toLocaleString()}{" "}
              <span className="text-xs font-bold text-gray-400">ETB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter System */}
      <GivingsFilter
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        amountFilter={amountFilter}
        setAmountFilter={setAmountFilter}
        onReset={handleReset}
      />

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <Target size={18} className="text-[#ff6719]" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
              Transaction Journal
            </h2>
          </div>
          <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Showing {filteredGivings.length} results
          </div>
        </div>
        <GivingsTable givings={filteredGivings} loading={loading} />
      </div>
    </div>
  );
}
