"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Loader2,
  Calendar,
  ClipboardList,
  User,
  Tag,
  ArrowRight,
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
  registrationDate: string;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
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
        setError(null);
      } catch (err) {
        console.error("Failed to fetch registrations", err);
        setError("Failed to load registration data.");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#ff6719] w-10 h-10" />
        <p className="mt-4 text-gray-500 font-medium tracking-wide italic">
          Preparing registration audit...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            Registrations
            <span className="text-xs bg-[#ff6719]/10 text-[#ff6719] px-2 py-1 rounded-full font-bold uppercase tracking-widest">
              Live
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            Audit and track community participation in events.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-orange-50 p-2.5 rounded-xl">
            <ClipboardList className="text-[#ff6719] w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Total Entries
            </div>
            <div className="text-2xl font-black text-gray-900">
              {registrations.length}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-2xl shadow-gray-200/40 overflow-hidden border border-gray-100 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/30">
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Attendee
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Event Description
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Registration Date
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
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
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm">
                        <User size={18} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-[#ff6719] transition-colors">
                          {reg.user?.fullName}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {reg.user?.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-[#ff6719] opacity-40" />
                      <span className="text-sm font-semibold text-gray-700 truncate max-w-[250px]">
                        {reg.event?.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 w-fit px-3 py-1.5 rounded-full border border-gray-100">
                      <Calendar size={12} className="text-gray-400" />
                      {reg.registrationDate
                        ? format(new Date(reg.registrationDate), "MMM d, yyyy")
                        : "Unknown"}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <button className="text-gray-300 hover:text-[#ff6719] transition-colors p-2 hover:bg-white rounded-xl shadow-none hover:shadow-sm border border-transparent hover:border-orange-100">
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-3xl mb-4 border border-gray-100 italic">
                        <ClipboardList size={48} className="text-gray-200" />
                      </div>
                      <p className="text-lg font-bold text-gray-400">
                        No active registrations
                      </p>
                      <p className="text-sm text-gray-300 mt-1 max-w-[200px] mx-auto">
                        Registration logs from users will be archived here.
                      </p>
                    </div>
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
