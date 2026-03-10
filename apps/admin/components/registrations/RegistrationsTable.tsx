import React from "react";
import {
  User,
  Tag,
  Calendar,
  ArrowRight,
  ClipboardList,
  Loader2,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

interface Registration {
  _id: string;
  event: {
    title: string;
  };
  user: {
    fullName: string;
    phoneNumber: string;
  };
  createdAt: string;
}

interface RegistrationsTableProps {
  registrations: Registration[];
  loading: boolean;
  error: string | null;
}

const RegistrationsTable = ({
  registrations,
  loading,
  error,
}: RegistrationsTableProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-[#ff6719] w-10 h-10" />
        <p className="text-gray-500 font-medium italic">
          Fetching registrations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-3xl border border-red-100">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <Shield className="text-red-500 w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-red-900">Error</h3>
        <p className="text-red-600 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-2xl shadow-gray-200/40 overflow-hidden border border-gray-100 rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/30">
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Attendee
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Event Description
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Registration Date
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {registrations.map((reg) => (
              <tr
                key={reg._id}
                className="hover:bg-orange-50/10 transition-all duration-300 group"
              >
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                      <User size={18} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 group-hover:text-[#ff6719] transition-colors">
                        {reg.user?.fullName || "Unknown User"}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">
                        {reg.user?.phoneNumber || "No Phone"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-50">
                      <Tag size={12} className="text-[#ff6719]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 truncate max-w-[250px]">
                      {reg.event?.title || "Unknown Event"}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 w-fit px-3 py-1.5 rounded-full border border-gray-100 transition-colors group-hover:bg-white group-hover:border-orange-100">
                    <Calendar
                      size={12}
                      className="text-gray-400 group-hover:text-[#ff6719]"
                    />
                    {reg.createdAt
                      ? format(new Date(reg.createdAt), "MMM d, yyyy")
                      : "Unknown"}
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right">
                  <button className="text-gray-300 hover:text-[#ff6719] transition-all p-2 hover:bg-white rounded-xl shadow-none hover:shadow-sm border border-transparent hover:border-orange-100 active:scale-90">
                    <ArrowRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-50 p-6 rounded-3xl mb-4 border border-gray-100 shadow-inner">
                      <ClipboardList size={48} className="text-gray-200" />
                    </div>
                    <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">
                      No Records Found
                    </p>
                    <p className="text-sm text-gray-300 mt-1 max-w-[250px] mx-auto font-medium">
                      Try adjusting your search or filters to find what you're
                      looking for.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationsTable;
