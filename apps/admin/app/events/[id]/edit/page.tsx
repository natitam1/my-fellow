"use client";

import React, { useEffect, useState } from "react";
import { EventForm } from "@/components/EventForm";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function EditEventPage() {
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get("admin/events");
        const raw = response.data?.data ?? response.data;
        const list = Array.isArray(raw) ? raw : [];
        const found = list.find((e: { _id: string }) => e._id === params.id);
        setEvent(found ?? null);
      } catch (error) {
        console.error("Failed to fetch event", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchEvent();
  }, [params.id]);

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!event) return <div className="text-center p-12">Event not found</div>;

  return <EventForm initialData={event} />;
}
