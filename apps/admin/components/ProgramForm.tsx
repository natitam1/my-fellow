"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loader2, Upload, X, MapPin } from "lucide-react";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

interface ProgramFormProps {
  initialData?: any;
}

export function ProgramForm({ initialData }: ProgramFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    day: "",
    time: "",
    category: "",
    location: "",
    lat: "",
    lng: "",
    image: "",
  });
  const [showMap, setShowMap] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        day: initialData.day || "",
        time: initialData.time || "",
        category: initialData.category || "",
        location: initialData.location || "",
        lat: initialData.coordinates?.lat?.toString() || "",
        lng: initialData.coordinates?.lng?.toString() || "",
        image: initialData.image || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
        title: formData.title,
        description: formData.description,
        day: formData.day,
        time: formData.time,
        category: formData.category,
        location: formData.location,
        coordinates: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        },
        image: formData.image,
      };

      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "coordinates") {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, String(value));
        }
      });

      if (imageFile) {
        form.append("image", imageFile);
      } else if (isEditing && initialData.image) {
        form.append("image", initialData.image);
      } else if (!isEditing) {
        toast.error("Please upload an image");
        setLoading(false);
        return;
      }

      if (isEditing) {
        await api.put(`/programs/${initialData._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/programs", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(
        isEditing
          ? "Program updated successfully"
          : "Program created successfully",
      );
      router.push("/programs");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save program";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto py-6">
      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-4">
          {isEditing ? "Edit Program" : "Create New Program"}
        </h3>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Program Image
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
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6719] hover:text-[#e55a15] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#ff6719]"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image-upload"
                        name="image-upload"
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
              Program Title
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
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="day"
              className="block text-sm font-medium text-gray-700"
            >
              Day
            </label>
            <div className="mt-1">
              <select
                id="day"
                name="day"
                required
                value={formData.day}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              >
                <option value="">Select a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700"
            >
              Time
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="time"
                id="time"
                required
                placeholder="e.g. 10:00 AM - 12:00 PM"
                value={formData.time}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="category"
                id="category"
                required
                placeholder="e.g. Youth, Prayer, Study"
                value={formData.category}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="location"
                id="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="lat"
              className="block text-sm font-medium text-gray-700"
            >
              Latitude
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                step="any"
                name="lat"
                id="lat"
                required
                value={formData.lat}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="lng"
              className="block text-sm font-medium text-gray-700"
            >
              Longitude
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                step="any"
                name="lng"
                id="lng"
                required
                value={formData.lng}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
                title="Pick on Map"
              >
                <MapPin size={20} className="text-[#ff6719]" />
              </button>
            </div>
          </div>
        </div>

        {showMap && (
          <MapPicker
            initialLat={parseFloat(formData.lat) || undefined}
            initialLng={parseFloat(formData.lng) || undefined}
            onSelect={(lat, lng) => {
              setFormData({
                ...formData,
                lat: lat.toString(),
                lng: lng.toString(),
              });
            }}
            onClose={() => setShowMap(false)}
          />
        )}

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
              ) : isEditing ? (
                "Update Program"
              ) : (
                "Create Program"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
