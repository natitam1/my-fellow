import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UsersPaginationProps {
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  totalPages: number;
  totalUsers: number;
  currentCount: number;
}

const UsersPagination = ({
  page,
  setPage,
  totalPages,
  totalUsers,
  currentCount,
}: UsersPaginationProps) => {
  return (
    <div className="flex items-center justify-between bg-white px-8 py-5 border border-gray-100 rounded-3xl shadow-sm">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Showing <span className="text-gray-900">{currentCount}</span> of{" "}
        <span className="text-gray-900">{totalUsers}</span> users
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2.5 rounded-xl border border-gray-100 enabled:hover:bg-gray-50 disabled:opacity-30 transition-all group"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 group-enabled:group-hover:text-[#ff6719]" />
        </button>

        <div className="flex items-center gap-1 mx-2">
          {[...Array(totalPages)].map((_, i) => {
            const p = i + 1;
            // Only show current, first, last, and neighbors
            if (
              p === 1 ||
              p === totalPages ||
              (p >= page - 1 && p <= page + 1)
            ) {
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                    page === p
                      ? "bg-[#ff6719] text-white shadow-lg shadow-orange-200"
                      : "hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  {p}
                </button>
              );
            }
            if (p === page - 2 || p === page + 2) {
              return (
                <span key={p} className="text-gray-300 px-1">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-2.5 rounded-xl border border-gray-100 enabled:hover:bg-gray-50 disabled:opacity-30 transition-all group"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 group-enabled:group-hover:text-[#ff6719]" />
        </button>
      </div>
    </div>
  );
};

export default UsersPagination;
