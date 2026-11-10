"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ProgramForm } from "@/components/ProgramForm";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProgramPage() {
  const { id } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await api.get(`/programs/${id}`);
        setProgram(response.data.data || response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch program details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProgram();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-[#ff6719]" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">Program not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Program</h1>
      </div>
      <ProgramForm initialData={program} />
    </div>
  );
}
