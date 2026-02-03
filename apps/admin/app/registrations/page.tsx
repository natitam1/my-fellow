"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
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
  registrationDate: string;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await api.get("/admin/registrations");
        const raw = response.data;
        const backendRegs = Array.isArray(raw) ? raw : raw?.data || [];

        const mapped: Registration[] = backendRegs.map((r: any) => ({
          _id: r._id,
          event: {
            title: r.eventTitle || r.event?.title || "Unknown Event",
          },
          user: {
            fullName: r.fullName || r.user?.fullName || "Unknown User",
            phoneNumber: r.phoneNumber || r.user?.phoneNumber || "",
          },
          registrationDate:
            r.registrationDate || r.createdAt || new Date().toISOString(),
        }));

        setRegistrations(mapped);
      } catch (error) {
        console.error("Failed to fetch registrations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-[#ff6719]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>

      <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((reg) => (
                <tr
                  key={reg._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reg.event?.title || "Unknown Event"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reg.user?.fullName || "Unknown User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reg.user?.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reg.registrationDate
                      ? format(new Date(reg.registrationDate), "MMM d, yyyy")
                      : "N/A"}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No registrations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
