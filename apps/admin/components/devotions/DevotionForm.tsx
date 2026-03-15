"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loader2, Upload, X } from "lucide-react";

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
    date: "",
    type: "text",
    content: "",
    duration: "",
    caption: "",
    pageCount: "",
    bookFormat: "",
    tags: "",
    featured: false,
    audioUrl: "",
    pdfUrl: "",
    bookUrl: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        author: initialData.author || "",
        date: initialData.date || "",
        type: initialData.type || "text",
        content: initialData.content || "",
        duration: initialData.duration || "",
        caption: initialData.caption || "",
        pageCount: initialData.pageCount?.toString() || "",
        bookFormat: initialData.bookFormat || "",
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(", ")
          : "",
        featured: initialData.featured || false,
        audioUrl: initialData.audioUrl || "",
        pdfUrl: initialData.pdfUrl || "",
        bookUrl: initialData.bookUrl || "",
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
        // For text devotions, if we didn't change the image, we still need to send the old URL
        // However, our API replaces if imageFile is present, else it relies on `image` in body schema
        // The validator expects `image` to be present if it's text context (or handled natively)
        // Ensure image URL is passed if no new file is selected.
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
      router.push("/devotions");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
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
              Cover Image *
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
                      <span>Upload cover image</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!isEditing && !formData.type}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
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
              <option value="text">Text</option>
              <option value="voice">Voice (Audio)</option>
              <option value="pdf">PDF Document</option>
              <option value="book">Book (EPUB/PDF)</option>
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
              className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date * (e.g. October 24, 2023)
            </label>
            <input
              type="text"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
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
              placeholder="faith, hope, love"
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
              className="ml-2 block text-sm text-gray-900"
            >
              Featured Devotion
            </label>
          </div>

          {/* CONDITIONAL FIELDS BASED ON TYPE */}
          <div className="sm:col-span-6 border-t pt-6 mt-2">
            <h4 className="text-md font-medium text-gray-900 mb-4 capitalize">
              {formData.type} Details
            </h4>

            {formData.type === "text" && (
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={10}
                  required={formData.type === "text"}
                  value={formData.content}
                  onChange={handleChange}
                  className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            )}

            {formData.type === "voice" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Audio File *
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleMediaChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#ff6719] file:text-white hover:file:bg-[#e55a15]"
                  />
                  {formData.audioUrl && !mediaFile && (
                    <p className="text-xs text-blue-500 mt-1">
                      Current File: {formData.audioUrl}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Duration (e.g. 5:30)
                    </label>
                    <input
                      type="text"
                      name="duration"
                      id="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="caption"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Caption / Short Desc
                    </label>
                    <input
                      type="text"
                      name="caption"
                      id="caption"
                      value={formData.caption}
                      onChange={handleChange}
                      className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === "pdf" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PDF Document *
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleMediaChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#ff6719] file:text-white hover:file:bg-[#e55a15]"
                  />
                  {formData.pdfUrl && !mediaFile && (
                    <p className="text-xs text-blue-500 mt-1">
                      Current File: {formData.pdfUrl}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="pageCount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Page Count
                  </label>
                  <input
                    type="number"
                    name="pageCount"
                    id="pageCount"
                    value={formData.pageCount}
                    onChange={handleChange}
                    className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
            )}

            {formData.type === "book" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Book File (EPUB, PDF, etc) *
                  </label>
                  <input
                    type="file"
                    onChange={handleMediaChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#ff6719] file:text-white hover:file:bg-[#e55a15]"
                  />
                  {formData.bookUrl && !mediaFile && (
                    <p className="text-xs text-blue-500 mt-1">
                      Current File: {formData.bookUrl}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="bookFormat"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Format (e.g. EPUB, PDF)
                  </label>
                  <input
                    type="text"
                    name="bookFormat"
                    id="bookFormat"
                    value={formData.bookFormat}
                    onChange={handleChange}
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
