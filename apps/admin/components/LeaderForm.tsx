"use client";

import api from "@/lib/api";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface LeaderFormProps {
  initialData?: any;
}

export function LeaderForm({ initialData }: LeaderFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    phoneNumber: "",
    telegram: "",
    type: "",
    isVerified: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        role: initialData.role || "",
        bio: initialData.bio || "",
        phoneNumber: initialData.phoneNumber || "",
        telegram: initialData.telegram || "",
        type: initialData.type || "",
        isVerified: initialData.isVerified || false,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, String(value));
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
        await api.put(`/leaders/${initialData._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/leaders", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(
        isEditing
          ? "Leader updated successfully"
          : "Leader created successfully",
      );
      router.push("/leaders");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save leader";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto py-6">
      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-4">
          {isEditing ? "Edit Leader" : "Add New Leader"}
        </h3>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Leader Image
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

          <div className="sm:col-span-3">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
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

          <div className="sm:col-span-3">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="role"
                id="role"
                required
                placeholder="e.g. Senior Pastor, Youth Leader"
                value={formData.role}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              Bio
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                name="bio"
                rows={4}
                required
                value={formData.bio}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="telegram"
              className="block text-sm font-medium text-gray-700"
            >
              Telegram Username
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="telegram"
                id="telegram"
                required
                placeholder="@username"
                value={formData.telegram}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </label>
            <div className="mt-1">
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              >
                <option value="">Select type</option>
                <option value="Main Leader">Main Leader</option>
                <option value="Team Leader">Team Leader</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-3 flex items-center pt-6">
            <div className="flex items-center h-5">
              <input
                id="isVerified"
                name="isVerified"
                type="checkbox"
                checked={formData.isVerified}
                onChange={handleChange}
                className="focus:ring-[#ff6719] h-4 w-4 text-[#ff6719] border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isVerified" className="font-medium text-gray-700">
                Verified Leader
              </label>
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
              ) : isEditing ? (
                "Update Leader"
              ) : (
                "Add Leader"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
