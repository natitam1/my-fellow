import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalPages: number;
  totalItems: number;
  currentCount: number;
  label?: string;
}

const AdminPagination = ({
  page,
  setPage,
  limit,
  setLimit,
  totalPages,
  totalItems,
  currentCount,
  label = "Items",
}: AdminPaginationProps) => {
  if (totalItems === 0) return null;

  const handlePrev = () => setPage((p) => Math.max(1, (p as number) - 1));
  const handleNext = () =>
    setPage((p) => Math.min(totalPages, (p as number) + 1));

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-gray-100">
      <div className="flex items-center gap-6">
        <div className="text-xs font-semibold text-gray-500">
          Showing <span className="text-gray-900">{currentCount}</span> of{" "}
          <span className="text-gray-900">{totalItems}</span> {label}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-gray-300 transition-colors"
          >
            {[5, 10, 20, 50, 100].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            if (
              totalPages > 5 &&
              p !== 1 &&
              p !== totalPages &&
              Math.abs(p - page) > 1
            ) {
              if (Math.abs(p - page) === 2)
                return (
                  <span key={p} className="text-gray-300 px-1">
                    ...
                  </span>
                );
              return null;
            }

            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  page === p
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
