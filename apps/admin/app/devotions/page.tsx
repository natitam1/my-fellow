"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Loader2,
  PlayCircle,
  BookOpen,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Devotion {
  _id: string;
  title: string;
  author: string;
  date: string;
  type: string;
  views: number;
  likes: number;
}

export default function DevotionsPage() {
  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevotions = async () => {
    try {
      const response = await api.get("/devotions");
      const raw = response.data;
      const devotionsData = Array.isArray(raw) ? raw : raw?.data || [];
      setDevotions(devotionsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch devotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevotions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this devotion?")) return;
    try {
      await api.delete(`/devotions/${id}`);
      toast.success("Devotion deleted");
      fetchDevotions();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete devotion");
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "voice":
        return <PlayCircle className="w-4 h-4 mr-1 text-blue-500" />;
      case "pdf":
        return <FileText className="w-4 h-4 mr-1 text-red-500" />;
      case "book":
        return <BookOpen className="w-4 h-4 mr-1 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 mr-1 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Devotions</h1>
        <Link
          href="/devotions/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a15] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Devotion
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#ff6719]" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {devotions.map((devotion) => (
              <li key={devotion._id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-[#ff6719] truncate">
                          {devotion.title}
                        </p>
                        <span className="ml-2 flex flex-row items-center font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs shadow-sm capitalize border border-gray-200">
                          {getIconForType(devotion.type)} {devotion.type}
                        </span>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          <span className="font-medium">By:</span>&nbsp;
                          {devotion.author}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          <span className="font-medium">Date:</span>&nbsp;
                          {devotion.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>
                            Views: {devotion.views} | Likes: {devotion.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 shrink-0 flex gap-2">
                    <Link
                      href={`/devotions/${devotion._id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(devotion._id)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {devotions.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                No devotions found. Create one!
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
