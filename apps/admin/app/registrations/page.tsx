"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { ClipboardList } from "lucide-react";
import RegistrationsFilter from "@/components/registrations/RegistrationsFilter";
import RegistrationsTable from "@/components/registrations/RegistrationsTable";
import RegistrationsPagination from "@/components/registrations/RegistrationsPagination";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistrations, setTotalRegistrations] = useState(0);

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [eventId, setEventId] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [events, setEvents] = useState<any[]>([]);

  // Debounce search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get("/admin/events");
      const raw = response.data;
      const eventsData = Array.isArray(raw) ? raw : raw?.data || [];
      setEvents(eventsData);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (eventId !== "all") params.append("eventId", eventId);
      if (teamFilter !== "all") params.append("team", teamFilter);
      if (yearFilter !== "all") params.append("yearOfStudy", yearFilter);
      if (departmentFilter !== "all")
        params.append("department", departmentFilter);

      const response = await api.get(
        `/admin/registrations?${params.toString()}`,
      );
      const raw = response.data;

      if (raw.pagination) {
        setRegistrations(raw.data || []);
        setTotalPages(raw.pagination.totalPages);
        setTotalRegistrations(raw.pagination.total);
      } else {
        const data = Array.isArray(raw) ? raw : raw?.data || [];
        setRegistrations(data);
        setTotalRegistrations(data.length);
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch registrations", err);
      setError(
        "Failed to load registration data. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    eventId,
    teamFilter,
    yearFilter,
    departmentFilter,
  ]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, eventId, teamFilter, yearFilter, departmentFilter]);

  const handleReset = () => {
    setSearch("");
    setEventId("all");
    setTeamFilter("all");
    setYearFilter("all");
    setDepartmentFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            Registrations
            <span className="text-[10px] bg-[#ff6719]/10 text-[#ff6719] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] border border-[#ff6719]/20">
              Live
            </span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Monitor and manage event participation across the community.
          </p>
        </div>
        <div className="flex items-center gap-6 bg-white p-5 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 transition-all hover:shadow-orange-100/30 group">
          <div className="bg-orange-50 p-3.5 rounded-2xl group-hover:rotate-6 transition-transform">
            <ClipboardList className="text-[#ff6719] w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] font-mono mb-1">
              Total Entries
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tighter">
              {totalRegistrations}
            </div>
          </div>
        </div>
      </div>

      <RegistrationsFilter
        search={search}
        setSearch={setSearch}
        events={events}
        eventId={eventId}
        setEventId={setEventId}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        onReset={handleReset}
      />

      <RegistrationsTable
        registrations={registrations}
        loading={loading}
        error={error}
      />

      <RegistrationsPagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        totalRegistrations={totalRegistrations}
        currentCount={registrations.length}
      />
    </div>
  );
}
