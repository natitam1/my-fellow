import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RegistrationsPaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalRegistrations: number;
  currentCount: number;
}

const RegistrationsPagination = ({
  page,
  setPage,
  totalPages,
  totalRegistrations,
  currentCount,
}: RegistrationsPaginationProps) => {
  if (totalPages <= 1 && totalRegistrations <= 10) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all duration-300">
      <div className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
        Showing <span className="text-gray-900">{currentCount}</span> of{" "}
        <span className="text-gray-900">{totalRegistrations}</span> entries
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-[#ff6719] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1.5 px-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            // Basic pagination logic to show limited numbers if many pages
            if (
              totalPages > 7 &&
              p !== 1 &&
              p !== totalPages &&
              Math.abs(p - page) > 1
            ) {
              if (Math.abs(p - page) === 2)
                return (
                  <span key={p} className="text-gray-300 font-black">
                    .
                  </span>
                );
              return null;
            }

            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all active:scale-90 ${
                  page === p
                    ? "bg-[#ff6719] text-white shadow-lg shadow-orange-200 border border-[#ff6719]"
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
          className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-[#ff6719] hover:border-orange-100 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all active:scale-90"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default RegistrationsPagination;
