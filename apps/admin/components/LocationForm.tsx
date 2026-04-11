"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loader2, Upload, X, Plus, Trash2, MapPin } from "lucide-react";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

interface LocationFormProps {
  initialData?: any;
}

export function LocationForm({ initialData }: LocationFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    googleMapsUrl: "",
  });
  const [showMap, setShowMap] = useState(false);
  const [serviceTimes, setServiceTimes] = useState<string[]>([""]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        address: initialData.address || "",
        latitude: initialData.coordinates?.latitude?.toString() || "",
        longitude: initialData.coordinates?.longitude?.toString() || "",
        googleMapsUrl: initialData.googleMapsUrl || "",
      });
      setServiceTimes(initialData.serviceTimes || [""]);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceTimeChange = (index: number, value: string) => {
    const newTimes = [...serviceTimes];
    newTimes[index] = value;
    setServiceTimes(newTimes);
  };

  const addServiceTime = () => {
    setServiceTimes([...serviceTimes, ""]);
  };

  const removeServiceTime = (index: number) => {
    if (serviceTimes.length > 1) {
      const newTimes = [...serviceTimes];
      newTimes.splice(index, 1);
      setServiceTimes(newTimes);
    }
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
        name: formData.name,
        address: formData.address,
        coordinates: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        serviceTimes: serviceTimes.filter((t) => t.trim() !== ""),
        googleMapsUrl: formData.googleMapsUrl,
      };

      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "coordinates" || key === "serviceTimes") {
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
        await api.put(`/locations/${initialData._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/locations", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(
        isEditing
          ? "Location updated successfully"
          : "Location created successfully",
      );
      router.push("/locations");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save location";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto py-6">
      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-4">
          {isEditing ? "Edit Location" : "Create New Location"}
        </h3>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Location Image
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
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Location Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="address"
                id="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="latitude"
              className="block text-sm font-medium text-gray-700"
            >
              Latitude
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                step="any"
                name="latitude"
                id="latitude"
                required
                value={formData.latitude}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="longitude"
              className="block text-sm font-medium text-gray-700"
            >
              Longitude
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                step="any"
                name="longitude"
                id="longitude"
                required
                value={formData.longitude}
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
            initialLat={parseFloat(formData.latitude) || undefined}
            initialLng={parseFloat(formData.longitude) || undefined}
            onSelect={(lat, lng) => {
              setFormData({
                ...formData,
                latitude: lat.toString(),
                longitude: lng.toString(),
              });
            }}
            onClose={() => setShowMap(false)}
          />
        )}

        <div className="sm:col-span-6">
          <label
            htmlFor="googleMapsUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Google Maps URL
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="googleMapsUrl"
              id="googleMapsUrl"
              required
              value={formData.googleMapsUrl}
              onChange={handleChange}
              className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Times
          </label>
          {serviceTimes.map((time, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={time}
                onChange={(e) => handleServiceTimeChange(index, e.target.value)}
                placeholder="e.g. Sunday 10:00 AM"
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
              <button
                type="button"
                onClick={() => removeServiceTime(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md border border-red-200 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addServiceTime}
            className="mt-2 inline-flex items-center px-3 py-1.5 border border-[#ff6719] text-xs font-medium rounded text-[#ff6719] hover:bg-orange-50 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Time
          </button>
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
            ) : isEditing ? (
              "Update Location"
            ) : (
              "Create Location"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
