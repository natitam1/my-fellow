"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import GivingsFilter from "@/components/givings/GivingsFilter";
import GivingsTable from "@/components/givings/GivingsTable";
import AdminPagination from "@/components/shared/AdminPagination";

export default function GivingsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Debounce search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (typeFilter !== "all") params.append("type", typeFilter);

      const response = await api.get(
        `/admin/transactions?${params.toString()}`,
      );
      const raw = response.data;

      if (raw.pagination) {
        setTransactions(raw.data || []);
        setTotalPages(raw.pagination.totalPages);
        setTotalTransactions(raw.pagination.total);
      } else {
        const data = Array.isArray(raw) ? raw : raw?.data || [];
        setTransactions(data);
        setTotalTransactions(data.length);
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setError("Failed to load giving transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter]);

  const handleReset = () => {
    setSearch("");
    setTypeFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-(--screen-2xl) mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Givings</h1>
      </div>

      <GivingsFilter
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        onReset={handleReset}
      />

      <div className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-xs">
        <GivingsTable transactions={transactions} loading={loading} />

        <AdminPagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalPages={totalPages}
          totalItems={totalTransactions}
          currentCount={transactions.length}
          label="Transactions"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
