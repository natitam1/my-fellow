import React from "react";
import {
  User as UserIcon,
  Tag,
  Calendar,
  ArrowRight,
  ClipboardList,
  Loader2,
  Shield,
  Phone,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

interface Registration {
  _id: string;
  event: {
    title: string;
  };
  user: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    profileImage?: string | null;
    telegramUserName?: string;
    department?: string;
    yearOfStudy?: string;
    team?: string;
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
  const formatTelegram = (username: string) => {
    if (!username) return "";
    return username.startsWith("@") ? username : `@${username}`;
  };

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
            <tr className="bg-gray-50/30 font-mono">
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Attendee
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Contact & Social
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Academics & Team
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Event Details
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50/50">
            {registrations.map((reg) => (
              <tr
                key={reg._id}
                className="hover:bg-orange-50/10 transition-all duration-300 group"
              >
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-11 w-11 shrink-0">
                      {reg.user?.profileImage ? (
                        <img
                          src={reg.user.profileImage}
                          alt={reg.user.fullName}
                          className="h-11 w-11 rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all shadow-sm group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform font-bold text-sm">
                          {reg.user?.fullName
                            ? reg.user.fullName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 group-hover:text-[#ff6719] transition-colors">
                        {reg.user?.fullName || "Unknown User"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium font-mono mt-0.5">
                        ID: {reg.user?._id?.substring(0, 8) || "N/A"}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex flex-col space-y-1.5">
                    <div className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center">
                        <Phone size={11} className="text-[#ff6719]/70" />
                      </div>
                      {reg.user?.phoneNumber || "No Phone"}
                    </div>
                    {reg.user?.telegramUserName && (
                      <div className="text-xs text-blue-600/70 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                          <MessageSquare size={11} className="text-blue-400" />
                        </div>
                        {formatTelegram(reg.user.telegramUserName)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-gray-700">
                      {reg.user?.department || "No Department"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                        {reg.user?.yearOfStudy || "N/A"}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-orange-50 text-[#ff6719] font-bold uppercase tracking-wider border border-orange-100/50">
                        {reg.user?.team || "No Team"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-50">
                        <Tag size={12} className="text-[#ff6719]" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 truncate max-w-[200px]">
                        {reg.event?.title || "Unknown Event"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-100 transition-colors group-hover:bg-white group-hover:border-orange-100">
                      <Calendar
                        size={11}
                        className="text-gray-400 group-hover:text-[#ff6719]"
                      />
                      {reg.createdAt
                        ? format(new Date(reg.createdAt), "MMM d, yyyy")
                        : "Unknown"}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right">
                  <button className="text-gray-300 hover:text-[#ff6719] transition-all p-2.5 hover:bg-white rounded-xl shadow-none hover:shadow-md border border-transparent hover:border-orange-100 active:scale-90 group-hover:text-[#ff6719]">
                    <ArrowRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-50 p-8 rounded-[2rem] mb-6 border border-gray-100 shadow-inner">
                      <ClipboardList size={56} className="text-gray-200" />
                    </div>
                    <p className="text-xl font-black text-gray-400 uppercase tracking-[0.2em]">
                      No Records
                    </p>
                    <p className="text-sm text-gray-300 mt-2 max-w-[280px] mx-auto font-medium leading-relaxed">
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
