"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { ClipboardList } from "lucide-react";
import RegistrationsFilter from "@/components/registrations/RegistrationsFilter";
import RegistrationsTable from "@/components/registrations/RegistrationsTable";
import AdminPagination from "@/components/shared/AdminPagination";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
      const response = await api.get("/events");
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
    <div className="space-y-6 animate-in fade-in duration-700 pb-12 max-w-(--screen-2xl) mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
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

      <div className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-xs">
        <RegistrationsTable
          registrations={registrations}
          loading={loading}
          error={error}
        />

        <AdminPagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalPages={totalPages}
          totalItems={totalRegistrations}
          currentCount={registrations.length}
          label="Entries"
        />
      </div>
    </div>
  );
}
