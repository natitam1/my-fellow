"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Loader2,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

interface Team {
  _id: string;
  name: string;
  category: string;
  members: number;
  location: string;
  leader: {
    name: string;
    role: string;
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const response = await api.get("/teams");
      const teamsData = response.data.data || response.data || [];
      setTeams(teamsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      await api.delete(`/teams/${id}`);
      toast.success("Team deleted");
      fetchTeams();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete team");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <Link
          href="/teams/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a15] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Team
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#ff6719]" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {teams.map((team) => (
              <li key={team._id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-[#ff6719] truncate">
                          {team.name}
                        </p>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {team.category}
                        </span>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {team.members} members
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <UserIcon className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>
                            Leader: {team.leader?.name} ({team.leader?.role})
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1 sm:mt-0">
                          <MapPin className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>{team.location || "No location set"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 shrink-0 flex gap-2">
                    <Link
                      href={`/teams/${team._id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(team._id)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {teams.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                No teams found. Create one!
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
