"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { DevotionForm } from "@/components/devotions/DevotionForm";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditDevotionPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevotion = async () => {
      try {
        const response = await api.get(`/devotions/${id}`);
        setInitialData(response.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load devotion data");
        router.push("/devotions");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDevotion();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6719]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Devotion</h1>
      </div>
      <DevotionForm initialData={initialData} />
    </div>
  );
}
