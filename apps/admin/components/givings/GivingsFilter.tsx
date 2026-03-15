"use client";

import React from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  DollarSign,
} from "lucide-react";

interface GivingsFilterProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  amountFilter: string;
  setAmountFilter: (val: string) => void;
  onReset: () => void;
}

export default function GivingsFilter({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  amountFilter,
  setAmountFilter,
  onReset,
}: GivingsFilterProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 space-y-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#ff6719] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#ff6719]/20 focus:bg-white transition-all outline-none"
            placeholder="Search by contributor name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48 relative">
          <select
            className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-[#ff6719]/20 focus:bg-white transition-all outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Amount Filter */}
        <div className="w-full lg:w-48 relative">
          <select
            className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-[#ff6719]/20 focus:bg-white transition-all outline-none cursor-pointer"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
          >
            <option value="all">Any Amount</option>
            <option value="0-1000">Under 1,000 ETB</option>
            <option value="1000-5000">1,000 - 5,000 ETB</option>
            <option value="5000+">5,000+ ETB</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
        >
          <X size={18} />
          <span>Reset</span>
        </button>
      </div>

      {/* Advanced Badges/Tags (Creative Filter) */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center">
          <Filter size={12} className="mr-1" /> Quick Filters:
        </span>
        {["Today", "This Week", "High Value", "Recurring"].map((tag) => (
          <button
            key={tag}
            className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-100 hover:border-[#ff6719]/30 hover:text-[#ff6719] hover:bg-orange-50 transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
