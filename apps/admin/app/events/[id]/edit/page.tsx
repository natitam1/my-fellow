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
        const response = await api.get(`/admin/events`); // Since we don't have getSingleEvent endpoint doc, filtering from list or assuming /events/:id works for admin too.
        // Wait, "Update Event ... PUT /api/events/:id". Usually there is a GET /api/events/:id or we can find it in the list.
        // The doc doesn't explicitly mention GET /api/events/:id for admin, but it's likely there.
        // Let's try finding it in the list first if GET single fails? No that's inefficient.
        // Let's assume GET /api/admin/events returns all, so we can just find it there if list is small, OR try GET /api/events/:id.
        // Actually, fetching all events just to find one to edit is okay for an Admin dashboard with limited events.

        // Let's try to match the ID from the list for now to be safe with the docs provided.
        // Or better, assume standard REST.

        const allEvents = await api.get("/admin/events");
        const found = allEvents.data.find((e: any) => e._id === params.id);
        setEvent(found);
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
