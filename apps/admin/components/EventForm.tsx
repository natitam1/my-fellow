"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/lib/api";
import { Loader2, Upload, X } from "lucide-react";

interface EventFormProps {
  initialData?: any;
}

export function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null,
  );
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    startDate: "",
    endDate: "",
    buttonText: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        shortDescription: initialData.shortDescription || "",
        fullDescription: initialData.fullDescription || "",
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().slice(0, 16)
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().slice(0, 16)
          : "",
        buttonText: initialData.buttonText || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (imageFile) {
        const form = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          form.append(key, value);
        });
        form.append("image", imageFile);

        if (isEditing) {
          await api.put(`/events/${initialData._id}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.post("/events", form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const jsonPayload = isEditing
          ? { ...payload, imageUrl: initialData.imageUrl }
          : payload;

        if (isEditing) {
          await api.put(`/events/${initialData._id}`, jsonPayload);
        } else {
          await api.post("/events", jsonPayload);
        }
      }

      toast.success(
        isEditing ? "Event updated successfully" : "Event created successfully",
      );
      router.push("/events");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save event";
      console.error("Event save error:", error.response?.data);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto py-6">
      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-4">
          {isEditing ? "Edit Event" : "Create New Event"}
        </h3>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Banner Image
            </label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:border-[#ff6719] transition-colors bg-gray-50">
              {imagePreview ? (
                <div className="relative w-full h-64">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6719] hover:text-[#e55a15] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#ff6719]"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!isEditing}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Event Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="shortDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Short Description
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="shortDescription"
                id="shortDescription"
                required
                value={formData.shortDescription}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="fullDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Full Description
            </label>
            <div className="mt-1">
              <textarea
                id="fullDescription"
                name="fullDescription"
                rows={4}
                required
                value={formData.fullDescription}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <div className="mt-1">
              <input
                type="datetime-local"
                name="startDate"
                id="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <div className="mt-1">
              <input
                type="datetime-local"
                name="endDate"
                id="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="buttonText"
              className="block text-sm font-medium text-gray-700"
            >
              CTA Button Text
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="buttonText"
                id="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                placeholder="e.g. Register Now"
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6719]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#ff6719] hover:bg-[#e55a15] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6719] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Save Event"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
