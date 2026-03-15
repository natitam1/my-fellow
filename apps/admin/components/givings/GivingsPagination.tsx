"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GivingsPaginationProps {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalPages: number;
  totalGivings: number;
  currentCount: number;
}

const GivingsPagination = ({
  page,
  setPage,
  limit,
  setLimit,
  totalPages,
  totalGivings,
  currentCount,
}: GivingsPaginationProps) => {
  if (totalGivings === 0) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 px-8 bg-white rounded-4xl border border-gray-100 shadow-xl shadow-gray-200/30 transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-100">
          Showing{" "}
          <span className="text-gray-900 font-bold">{currentCount}</span> of{" "}
          <span className="text-gray-900 font-bold">{totalGivings}</span>{" "}
          Records
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Rows:
          </span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-100 text-gray-900 text-xs font-bold rounded-xl focus:ring-[#ff6719]/20 focus:border-[#ff6719] block px-3 py-1.5 outline-none cursor-pointer hover:bg-white transition-all"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-3 rounded-2xl border border-gray-100 text-gray-400 hover:text-[#ff6719] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 group"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            if (
              totalPages > 7 &&
              p !== 1 &&
              p !== totalPages &&
              Math.abs(p - page) > 1
            ) {
              if (Math.abs(p - page) === 2)
                return (
                  <span key={p} className="text-gray-200 px-1 font-black">
                    ...
                  </span>
                );
              return null;
            }

            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-2xl text-[11px] font-black transition-all active:scale-90 ${
                  page === p
                    ? "bg-[#ff6719] text-white shadow-lg shadow-orange-100 border border-[#ff6719]"
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-100"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-3 rounded-2xl border border-gray-100 text-gray-400 hover:text-[#ff6719] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 group"
        >
          <ChevronRight
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};

export default GivingsPagination;
