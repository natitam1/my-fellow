"use client";

import React, { useEffect, useState } from "react";
import { EventForm } from "@/components/EventForm";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function EditEventPage() {
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        let found = null;
        try {
          const directRes = await api.get(`/events/${params.id}`);
          found = directRes.data?.data ?? directRes.data;
        } catch (e) {
          const response = await api.get("admin/events");
          const raw = response.data?.data ?? response.data;
          const list = Array.isArray(raw) ? raw : [];
          found = list.find((item: { _id: string }) => item._id === params.id) ?? null;
        }
        setEvent(found ?? null);
      } catch (error) {
        console.error("Failed to fetch event", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchEvent();
  }, [params.id]);

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-[#ff6719]" />
      </div>
    );
  if (!event) return <div className="text-center p-12 text-gray-500">Event not found</div>;

  return <EventForm initialData={event} />;
}
