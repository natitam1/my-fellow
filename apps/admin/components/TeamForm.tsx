"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loader2, Upload, X, Users, MapPin } from "lucide-react";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

interface TeamFormProps {
  initialData?: any;
}

export function TeamForm({ initialData }: TeamFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null,
  );
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    color: "#ff6719",
    members: "0",
    description: "",
    about: "",
    meetingDay: "",
    time: "",
    category: "",
    location: "",
    lat: "",
    lng: "",
    leaderName: "",
    leaderRole: "",
    leaderTelegram: "",
    leaderPhone: "",
  });
  const [showMap, setShowMap] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [leaderImagePreview, setLeaderImagePreview] = useState<string | null>(
    initialData?.leader?.imageUrl || null,
  );
  const [leaderImageFile, setLeaderImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        icon: initialData.icon || "",
        color: initialData.color || "#ff6719",
        members: initialData.members?.toString() || "0",
        description: initialData.description || "",
        about: initialData.about || "",
        meetingDay: initialData.meetingDay || "",
        time: initialData.time || "",
        category: initialData.category || "",
        location: initialData.location || "",
        lat: initialData.coordinates?.lat?.toString() || "",
        lng: initialData.coordinates?.lng?.toString() || "",
        leaderName: initialData.leader?.name || "",
        leaderRole: initialData.leader?.role || "",
        leaderTelegram: initialData.leader?.telegram || "",
        leaderPhone: initialData.leader?.phone || "",
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

  const handleLeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLeaderImageFile(file);
      setLeaderImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        members: parseInt(formData.members),
        description: formData.description,
        about: formData.about,
        meetingDay: formData.meetingDay,
        time: formData.time,
        category: formData.category,
        location: formData.location,
        coordinates: {
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0,
        },
        leader: {
          name: formData.leaderName,
          role: formData.leaderRole,
          telegram: formData.leaderTelegram,
          phone: formData.leaderPhone,
        },
      };

      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "coordinates" || key === "leader") {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, String(value));
        }
      });

      if (imageFile) {
        form.append("image", imageFile);
      } else if (isEditing && initialData.imageUrl) {
        form.append("imageUrl", initialData.imageUrl);
      }

      if (leaderImageFile) {
        form.append("leaderImage", leaderImageFile);
      }

      if (isEditing) {
        await api.put(`/teams/${initialData._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/teams", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(
        isEditing ? "Team updated successfully" : "Team created successfully",
      );
      router.push("/teams");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save team";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-8">
        {/* Basic Info */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">
                Team Image
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
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6719] hover:text-[#e55a15]"
                      >
                        <span>Upload a file</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Team Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <input
                type="text"
                name="category"
                id="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="members"
                className="block text-sm font-medium text-gray-700"
              >
                Initial Members
              </label>
              <input
                type="number"
                name="members"
                id="members"
                value={formData.members}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="icon"
                className="block text-sm font-medium text-gray-700"
              >
                Icon (Lucide name)
              </label>
              <input
                type="text"
                name="icon"
                id="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="e.g. Users, Music"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700"
              >
                Theme Color
              </label>
              <input
                type="color"
                name="color"
                id="color"
                value={formData.color}
                onChange={handleChange}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm p-1"
              />
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Short Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700"
              >
                About/Details
              </label>
              <textarea
                id="about"
                name="about"
                rows={3}
                value={formData.about}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
          </div>
        </section>

        {/* Meeting Details */}
        <section>
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Meeting Details & Location
            </h3>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6719]"
            >
              <MapPin size={14} className="mr-1.5 text-[#ff6719]" />
              Pick on Map
            </button>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="meetingDay"
                className="block text-sm font-medium text-gray-700"
              >
                Meeting Day
              </label>
              <input
                type="text"
                name="meetingDay"
                id="meetingDay"
                value={formData.meetingDay}
                onChange={handleChange}
                placeholder="e.g. Fridays"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700"
              >
                Meeting Time
              </label>
              <input
                type="text"
                name="time"
                id="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g. 5:00 PM"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location Label
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Room 302"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="lat"
                className="block text-sm font-medium text-gray-700"
              >
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="lat"
                id="lat"
                value={formData.lat}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="lng"
                className="block text-sm font-medium text-gray-700"
              >
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="lng"
                id="lng"
                value={formData.lng}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
          </div>
        </section>

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

        {/* Leader Info */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
            Team Leader
          </h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">
                Leader Image
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:border-[#ff6719] transition-colors bg-gray-50">
                {leaderImagePreview ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={leaderImagePreview}
                      alt="Leader Preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLeaderImagePreview(null);
                        setLeaderImageFile(null);
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
                        htmlFor="leader-image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6719] hover:text-[#e55a15]"
                      >
                        <span>Upload a file</span>
                        <input
                          id="leader-image-upload"
                          name="leader-image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleLeaderImageChange}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="leaderName"
                className="block text-sm font-medium text-gray-700"
              >
                Leader Name
              </label>
              <input
                type="text"
                name="leaderName"
                id="leaderName"
                required
                value={formData.leaderName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="leaderRole"
                className="block text-sm font-medium text-gray-700"
              >
                Leader Role
              </label>
              <input
                type="text"
                name="leaderRole"
                id="leaderRole"
                required
                value={formData.leaderRole}
                onChange={handleChange}
                placeholder="e.g. Team Principal"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="leaderTelegram"
                className="block text-sm font-medium text-gray-700"
              >
                Leader Telegram
              </label>
              <input
                type="text"
                name="leaderTelegram"
                id="leaderTelegram"
                value={formData.leaderTelegram}
                onChange={handleChange}
                placeholder="@username"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="leaderPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Leader Phone
              </label>
              <input
                type="text"
                name="leaderPhone"
                id="leaderPhone"
                value={formData.leaderPhone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm"
              />
            </div>
          </div>
        </section>

        <div className="pt-5 flex justify-end">
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
              "Update Team"
            ) : (
              "Create Team"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
