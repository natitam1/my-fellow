"use client";

import api from "@/lib/api";
import { Check, Clock, Loader2, ShieldAlert, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface JoinRequest {
  _id: string;
  fullName: string;
  phoneNumber: string;
  department: string;
  year: string;
  telegramHandle: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
  teamId: {
    _id: string;
    name: string;
  };
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/join-requests");
      const requestsData = response.data.data || response.data || [];
      setRequests(requestsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch join requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;
    setActionLoading(id);
    try {
      await api.patch(`/join-requests/${id}/status`, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${status} request`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Join Requests</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#ff6719]" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {requests.map((req) => (
              <li key={req._id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-[#ff6719] truncate">
                          {req.fullName}
                        </p>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {req.teamId?.name || "Unknown Team"}
                        </span>
                        <span
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            req.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : req.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>
                            {req.phoneNumber} | {req.department} ({req.year})
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1 sm:mt-0">
                          <Clock className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {req.telegramHandle && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Telegram: {req.telegramHandle}</p>
                        </div>
                      )}
                      {req.message && (
                        <div className="mt-2 text-sm italic text-gray-500">
                          <p>"{req.message}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-5 shrink-0 flex gap-2">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(req._id, "approved")
                          }
                          disabled={actionLoading === req._id}
                          className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(req._id, "rejected")
                          }
                          disabled={actionLoading === req._id}
                          className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {requests.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500 flex flex-col items-center">
                <ShieldAlert className="mb-2 text-gray-300" size={32} />
                <p>No join requests found.</p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
