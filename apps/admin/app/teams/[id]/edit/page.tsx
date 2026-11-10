"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { TeamForm } from "@/components/TeamForm";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditTeamPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get(`/teams/${id}`);
        setTeam(response.data.data || response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch team details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-[#ff6719]" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Team</h1>
      </div>
      <TeamForm initialData={team} />
    </div>
  );
}
