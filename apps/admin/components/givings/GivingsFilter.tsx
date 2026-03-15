"use client";

import React from "react";
import { Search, RotateCcw, ChevronDown } from "lucide-react";

interface GivingsFilterProps {
  search: string;
  setSearch: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  onReset: () => void;
}

export default function GivingsFilter({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  onReset,
}: GivingsFilterProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-xs">
      <div className="flex-1 relative w-full md:w-auto">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name, phone or method..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none min-w-[140px]">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 appearance-none hover:bg-gray-100 focus:bg-white transition-all cursor-pointer outline-none"
          >
            <option value="all">All Methods</option>
            <option value="CBE">CBE</option>
            <option value="Telebirr">Telebirr</option>
            <option value="BOA">BOA</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all border border-amber-100 active:scale-95 group"
          title="Reset All Filters"
        >
          <RotateCcw
            size={13}
            className="group-hover:-rotate-45 transition-transform"
          />
          Reset
        </button>
      </div>
    </div>
  );
}
