"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Loader2,
  Clock,
  Map as MapIcon,
} from "lucide-react";
import toast from "react-hot-toast";

interface Location {
  _id: string;
  name: string;
  address: string;
  image: string;
  serviceTimes: string[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const response = await api.get("/locations");
      const locationsData = response.data.data || response.data || [];
      setLocations(locationsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      await api.delete(`/locations/${id}`);
      toast.success("Location deleted");
      fetchLocations();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete location");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        <Link
          href="/locations/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a15] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Location
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#ff6719]" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {locations.map((location) => (
              <li key={location._id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-[#ff6719] truncate">
                          {location.name}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapIcon className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>{location.address}</p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1 sm:mt-0">
                          <Clock className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>
                            {location.serviceTimes?.length || 0} service times
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 shrink-0 flex gap-2">
                    <Link
                      href={`/locations/${location._id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(location._id)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {locations.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                No locations found. Add one!
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
