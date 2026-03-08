import React from "react";
import {
  Phone,
  MessageSquare,
  Calendar,
  Shield,
  Users as UsersIcon,
  Loader2,
} from "lucide-react";
import { User } from "../../app/users/types";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
}

const UsersTable = ({ users, loading, error }: UsersTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTelegram = (username: string) => {
    if (!username) return "";
    return username.startsWith("@") ? username : `@${username}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-[#ff6719] w-10 h-10" />
        <p className="text-gray-500 font-medium">Loading registered users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-xl border border-red-100">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <Shield className="text-red-500 w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-red-900">Error</h3>
        <p className="text-red-600 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden border border-gray-100 rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                User Info
              </th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Contact & Social
              </th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Academics
              </th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Role
              </th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50/80 transition-all duration-200 group relative"
              >
                <td className="px-6 py-5 whitespace-nowrap relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6719] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center">
                    <div className="relative h-11 w-11 shrink-0">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="h-11 w-11 rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-base group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors">
                          {user.fullName
                            ? user.fullName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                          user.role === "admin"
                            ? "bg-indigo-500"
                            : "bg-emerald-500"
                        }`}
                      ></span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 group-hover:text-[#ff6719] transition-colors duration-200">
                        {user.fullName || "Unnamed User"}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {user._id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1.5">
                    <div className="text-xs font-medium text-gray-600 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-50/50 flex items-center justify-center">
                        <Phone size={11} className="text-[#ff6719]/60" />
                      </div>
                      {user.phoneNumber}
                    </div>
                    {user.telegramUserName && (
                      <div className="text-xs text-blue-600/70 flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer group/tg">
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center group-hover/tg:bg-blue-100 transition-colors">
                          <MessageSquare size={11} className="text-blue-400" />
                        </div>
                        {formatTelegram(user.telegramUserName)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold text-gray-700">
                      {user.department || "No Department"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold uppercase tracking-tight">
                        {user.yearOfStudy || "N/A"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-50 text-[#ff6719]/70 font-bold uppercase tracking-tight border border-orange-100/50">
                        {user.team || "No Team"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      user.role === "admin"
                        ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                        : "bg-gray-50 text-gray-500 border-gray-100"
                    }`}
                  >
                    {user.role === "admin" && (
                      <Shield size={10} className="mr-1.5" />
                    )}
                    {user.role || "user"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 font-bold">
                    <Calendar size={13} className="text-gray-400" />
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                      <UsersIcon className="text-gray-300 w-8 h-8" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No registered users found
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

export default UsersTable;
