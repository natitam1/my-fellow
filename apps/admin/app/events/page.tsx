"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Plus, Edit, Trash2, Calendar, Loader2, Eye, EyeOff, Users } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Event {
  _id: string;
  title: string;
  shortDescription: string;
  startDate: string;
  endDate: string;
  isPublished?: boolean;
  autoUnpublished?: boolean;
  registrationLimit?: number | null;
  registrationsCount?: number;
}

const formatSafeDate = (dateVal?: string | Date | null, pattern: string = "MMM d, yyyy HH:mm") => {
  if (!dateVal) return "N/A";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Invalid date";
  return format(d, pattern);
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events?scope=admin");
      const raw = response.data;
      const eventsData = Array.isArray(raw) ? raw : raw?.data || [];
      setEvents(eventsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  };

  const handleTogglePublish = async (id: string, currentStatus?: boolean) => {
    try {
      await api.patch(`/events/${id}/publish`, {
        isPublished: currentStatus === false,
      });
      toast.success(currentStatus === false ? "Event published" : "Event unpublished");
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update event visibility");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link
          href="/events/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a15] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Event
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#ff6719]" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event._id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex items-center gap-2 text-sm">
                        <p className="font-medium text-[#ff6719] truncate">
                          {event.title}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            event.isPublished !== false
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {event.isPublished !== false ? "Published" : "Unpublished"}
                        </span>
                        {event.autoUnpublished && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                            Limit Reached
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar
                            className="shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                            aria-hidden="true"
                          />
                          <p>
                            {formatSafeDate(event.startDate, "MMM d, yyyy HH:mm")}{" "}
                            - {formatSafeDate(event.endDate, "HH:mm")}
                          </p>
                        </div>
                        <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          <Users className="shrink-0 mr-1 h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {event.registrationsCount || 0} /{" "}
                            {event.registrationLimit ? `${event.registrationLimit} max` : "unlimited"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 shrink-0 flex gap-2 items-center">
                    <button
                      onClick={() => handleTogglePublish(event._id, event.isPublished)}
                      title={event.isPublished !== false ? "Unpublish Event" : "Publish Event"}
                      className={`p-2 rounded-full transition-colors ${
                        event.isPublished !== false
                          ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {event.isPublished !== false ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <Link
                      href={`/events/${event._id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {events.length === 0 && (
              <li className="px-4 py-12 text-center text-gray-500">
                <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-base font-medium text-gray-600">No events found</p>
                <p className="text-sm text-gray-400 mt-1">Create your first event or retreat to begin publishing to fellowship members.</p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
