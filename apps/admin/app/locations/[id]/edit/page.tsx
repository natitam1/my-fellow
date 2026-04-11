"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { LocationForm } from "@/components/LocationForm";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditLocationPage() {
  const { id } = useParams();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await api.get(`/locations/${id}`);
        setLocation(response.data.data || response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch location details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLocation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-[#ff6719]" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">Location not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Location</h1>
      </div>
      <LocationForm initialData={location} />
    </div>
  );
}
