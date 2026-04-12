import { Loader2, MessageSquare, Phone, Shield } from "lucide-react";
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
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Academic Info
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Joined Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 shrink-0">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="h-10 w-10 rounded-full object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm">
                          {user.fullName
                            ? user.fullName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                        {user.fullName || "Unnamed User"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {user._id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <div className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
                      <Phone size={12} className="text-gray-400" />
                      {user.phoneNumber}
                    </div>
                    {user.telegramUserName && (
                      <div className="text-xs text-brand-600 flex items-center gap-1.5 font-medium">
                        <MessageSquare size={12} className="text-brand-400" />
                        {formatTelegram(user.telegramUserName)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-xs font-semibold text-gray-700">
                      {user.department || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                        {user.yearOfStudy || "N/A"}
                      </span>
                      {user.team && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-100">
                          {typeof user.team === "object" && user.team
                            ? (user.team as any).name
                            : user.team || "No Team"}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.role === "admin"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role || "user"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                  {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400 text-sm italic font-medium"
                >
                  No registered users found
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
