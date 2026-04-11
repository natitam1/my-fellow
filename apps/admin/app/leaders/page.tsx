"use client";
//
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Loader2,
  Phone,
  Send,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Leader {
  _id: string;
  name: string;
  role: string;
  type: string;
  phoneNumber: string;
  telegram: string;
  isVerified: boolean;
  image: string;
}

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaders = async () => {
    try {
      const response = await api.get("/leaders");
      const leadersData = response.data.data || response.data || [];
      setLeaders(leadersData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch leaders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leader?")) return;
    try {
      await api.delete(`/leaders/${id}`);
      toast.success("Leader removed");
      fetchLeaders();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove leader");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leaders</h1>
        <Link
          href="/leaders/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a15] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Leader
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#ff6719]" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {leaders.map((leader) => (
              <li key={leader._id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10 relative rounded-full overflow-hidden border border-gray-100">
                        {leader.image ? (
                          <Image
                            src={leader.image}
                            alt={leader.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                            <UserCheck className="text-gray-400" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-[#ff6719] truncate">
                            {leader.name}
                          </p>
                          {leader.isVerified && (
                            <CheckCircle
                              className="ml-1 text-blue-500"
                              size={16}
                            />
                          )}
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {leader.type}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:gap-4">
                          <p className="text-sm text-gray-500 italic">
                            {leader.role}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 mt-1 sm:mt-0">
                            <Phone className="shrink-0 mr-1 h-3 w-3 text-gray-400" />
                            <p className="mr-3">{leader.phoneNumber}</p>
                            <Send className="shrink-0 mr-1 h-3 w-3 text-gray-400" />
                            <p>{leader.telegram}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 shrink-0 flex gap-2">
                    <Link
                      href={`/leaders/${leader._id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(leader._id)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {leaders.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                No leaders found. Add one!
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Helper to use Image in CSR
import Image from "next/image";
