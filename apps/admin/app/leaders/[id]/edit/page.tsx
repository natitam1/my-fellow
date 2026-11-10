"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { LeaderForm } from "@/components/LeaderForm";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditLeaderPage() {
  const { id } = useParams();
  const [leader, setLeader] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeader = async () => {
      try {
        const response = await api.get(`/leaders/${id}`);
        setLeader(response.data.data || response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch leader details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLeader();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-[#ff6719]" />
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">Leader not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Leader</h1>
      </div>
      <LeaderForm initialData={leader} />
    </div>
  );
}
