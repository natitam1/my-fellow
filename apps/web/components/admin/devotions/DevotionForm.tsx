"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loader2, Upload, X } from "lucide-react";
import { format } from "date-fns";

interface DevotionFormProps {
  initialData?: any;
}

export function DevotionForm({ initialData }: DevotionFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    date: format(new Date(), "MMMM d, yyyy"),
    type: "text",
    content: "",
    duration: "",
    caption: "",
    tags: "",
    featured: false,
    audioUrl: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        author: initialData.author || "",
        date: initialData.date || format(new Date(), "MMMM d, yyyy"),
        type: initialData.type || "text",
        content: initialData.content || "",
        duration: initialData.duration || "",
        caption: initialData.caption || "",
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(", ")
          : "",
        featured: initialData.featured || false,
        audioUrl: initialData.audioUrl || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.author.trim()) {
      toast.error("Author is required");
      return;
    }
    if (!formData.date.trim()) {
      toast.error("Date is required");
      return;
    }

    if (formData.type === "text" && !formData.content.trim()) {
      toast.error("Content is required for text devotions");
      return;
    }

    if (formData.type === "voice") {
      if (!isEditing && !mediaFile && !formData.audioUrl) {
        toast.error("Please upload an audio file for the voice devotion");
        return;
      }
      if (!formData.duration.trim()) {
        toast.error("Please specify audio duration (e.g. 5:20)");
        return;
      }
      if (!formData.caption.trim() && !formData.content.trim()) {
        toast.error("Voice devotions require a caption or transcript text");
        return;
      }
    }

    setLoading(true);

    try {
      const form = new FormData();

      // Append standard text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags") {
          const tagsArray = value
            .toString()
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          tagsArray.forEach((t) => form.append("tags", t));
        } else if (key === "featured") {
          form.append("featured", String(value));
        } else if (value !== null && value !== "") {
          form.append(key, String(value));
        }
      });

      // Append files
      if (imageFile) {
        form.append("image", imageFile);
      }
      if (mediaFile) {
        form.append("media", mediaFile);
      }

      if (isEditing) {
        if (!imageFile && initialData.image) {
          form.append("image", initialData.image);
        }
        await api.put(`/devotions/${initialData._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/devotions", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(
        isEditing
          ? "Devotion updated successfully"
          : "Devotion created successfully",
      );
      router.push("/admin/devotions");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.error ||
        "Failed to save devotion";
      console.error("Devotion save error:", error.response?.data);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-4">
          {isEditing ? "Edit Devotion" : "Create New Devotion"}
        </h3>

        <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
          {/* IMAGE UPLOAD */}
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Cover Image
            </label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:border-[#ff6719] transition-colors bg-gray-50">
              {imagePreview ? (
                <div className="relative w-full h-64">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    unoptimized
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
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6719] hover:text-[#e55a15] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#ff6719]"
                    >
                      <span>Upload cover image</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Walking in Fellowship and Grace"
              className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm rounded-md border"
            >
              <option value="text">Text Devotion</option>
              <option value="voice">Voice Devotion (Audio)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700"
            >
              Author *
            </label>
            <input
              type="text"
              name="author"
              id="author"
              required
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Pastor Yohannes / Executive Ministry"
              className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date * (e.g. October 24, 2024)
            </label>
            <input
              type="text"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
              placeholder="e.g. October 24, 2024"
              className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700"
            >
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="faith, grace, prayer, scripture"
              className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>

          <div className="sm:col-span-6 flex items-center">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-[#ff6719] focus:ring-[#ff6719] border-gray-300 rounded"
            />
            <label
              htmlFor="featured"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              Featured Devotion (pinned to spotlight hero banner)
            </label>
          </div>

          {/* CONDITIONAL FIELDS BASED ON TYPE */}
          <div className="sm:col-span-6 border-t pt-6 mt-2">
            <h4 className="text-md font-medium text-gray-900 mb-4 capitalize">
              {formData.type === "voice" ? "Voice Details" : "Text Details"}
            </h4>

            {formData.type === "text" && (
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Devotion Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={10}
                  required={formData.type === "text"}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write the full devotional message, scripture references, and reflection questions..."
                  className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            )}

            {formData.type === "voice" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Audio File {isEditing ? "(Optional if keeping existing file)" : "*"}
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleMediaChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#ff6719] file:text-white hover:file:bg-[#e55a15]"
                  />
                  {formData.audioUrl && !mediaFile && (
                    <p className="text-xs text-blue-600 mt-1 break-all">
                      Current Audio: {formData.audioUrl}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Duration * (e.g. 5:30)
                    </label>
                    <input
                      type="text"
                      name="duration"
                      id="duration"
                      required={formData.type === "voice"}
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g. 5:30"
                      className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="caption"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Caption / Short Summary *
                    </label>
                    <input
                      type="text"
                      name="caption"
                      id="caption"
                      required={formData.type === "voice"}
                      value={formData.caption}
                      onChange={handleChange}
                      placeholder="e.g. A guided prayer on trusting God through hardship"
                      className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Transcript / Additional Notes (Optional)
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={4}
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Full audio transcript or study notes..."
                    className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200 mt-8">
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
                "Update Devotion"
              ) : (
                "Save Devotion"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
