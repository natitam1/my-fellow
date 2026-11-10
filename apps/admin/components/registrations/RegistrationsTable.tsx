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
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Attendee
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Academic Info
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Event Details
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registrations.map((reg) => (
              <tr
                key={reg._id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 shrink-0">
                      {reg.user?.profileImage ? (
                        <img
                          src={reg.user.profileImage}
                          alt={reg.user.fullName}
                          className="h-10 w-10 rounded-full object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-semibold text-sm">
                          {reg.user?.fullName
                            ? reg.user.fullName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                        {reg.user?.fullName || "Unknown User"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {reg.user?._id?.substring(0, 8) || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <div className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
                      <Phone size={12} className="text-gray-400" />
                      {reg.user?.phoneNumber || "No Phone"}
                    </div>
                    {reg.user?.telegramUserName && (
                      <div className="text-xs text-brand-600 flex items-center gap-1.5 font-medium">
                        <MessageSquare size={12} className="text-brand-400" />
                        {formatTelegram(reg.user.telegramUserName)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-xs font-semibold text-gray-700">
                      {reg.user?.department || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                        {reg.user?.yearOfStudy || "N/A"}
                      </span>
                      {reg.user?.team && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-100">
                          {reg.user?.team}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Tag size={12} className="text-amber-600" />
                      <span className="text-sm font-semibold text-gray-700 truncate max-w-[180px]">
                        {reg.event?.title || "Unknown Event"}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                      <Calendar size={11} className="text-gray-300" />
                      {reg.createdAt
                        ? format(new Date(reg.createdAt), "MMM d, yyyy")
                        : "Unknown"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-gray-300 hover:text-amber-600 transition-colors p-1.5 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-100">
                    <ArrowRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <ClipboardList size={40} className="text-gray-200 mb-2" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      No Records Found
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
