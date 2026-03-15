"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loader2, Upload, X } from "lucide-react";

interface ProductFormProps {
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);

  // existing images from API (URLs)
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.imageUrls || [],
  );

  // new images selected by user (Files)
  const [newImages, setNewImages] = useState<File[]>([]);
  // preview URLs for new images
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    price: "",
    category: "other",
    stock: "0",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        shortDescription: initialData.shortDescription || "",
        price: initialData.price || "",
        category: initialData.category || "other",
        stock: initialData.stock?.toString() || "0",
      });
      setExistingImages(initialData.imageUrls || []);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);

      const previews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          form.append(key, String(value));
        }
      });

      // append files for upload middleware
      newImages.forEach((file) => {
        form.append("images", file);
      });

      // To keep existing images we send them back in imageUrls.
      // The API `ProductController.update` appends new files to `imageUrls` body property.
      existingImages.forEach((url) => {
        form.append("imageUrls", url);
      });

      if (isEditing) {
        await api.put(`/marketplace/products/${initialData.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
          transformRequest: [
            (data, headers) => {
              // Must remove default json headers so axios lets browser set multipart boundary
              delete headers["Content-Type"];
              return data;
            },
          ],
        });
      } else {
        await api.post("/marketplace/products", form, {
          headers: { "Content-Type": "multipart/form-data" },
          transformRequest: [
            (data, headers) => {
              delete headers["Content-Type"];
              return data;
            },
          ],
        });
      }

      toast.success(
        isEditing
          ? "Product updated successfully"
          : "Product created successfully",
      );
      router.push("/store");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to save product. Ensure all required fields (and at least 1 image) are provided.";
      console.error("Product save error:", error.response?.data);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-4">
          {isEditing ? "Edit Product" : "Create New Product"}
        </h3>

        <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
          {/* MULTIPLE IMAGE UPLOAD */}
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images * (Upload multiple)
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {existingImages.map((url, i) => (
                <div
                  key={`exist-${i}`}
                  className="relative h-24 w-24 bg-gray-100 rounded-md overflow-hidden border"
                >
                  <Image
                    src={url}
                    alt="product image"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {newImagePreviews.map((preview, i) => (
                <div
                  key={`new-${i}`}
                  className="relative h-24 w-24 bg-gray-100 rounded-md overflow-hidden border"
                >
                  <Image
                    src={preview}
                    alt="new product image"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <label className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 hover:text-[#ff6719] hover:border-[#ff6719] cursor-pointer bg-gray-50 transition-colors">
                <Upload size={24} />
                <span className="text-xs mt-1 font-medium">Add Image</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  required={
                    !isEditing &&
                    existingImages.length === 0 &&
                    newImages.length === 0
                  }
                />
              </label>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Product Title *
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
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm rounded-md border"
            >
              <option value="apparel">Apparel</option>
              <option value="books">Books</option>
              <option value="accessories">Accessories</option>
              <option value="music">Music</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="shortDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Short Description *
            </label>
            <textarea
              name="shortDescription"
              id="shortDescription"
              rows={3}
              required
              value={formData.shortDescription}
              onChange={handleChange}
              className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              id="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              name="stock"
              id="stock"
              required
              value={formData.stock}
              onChange={handleChange}
              className="mt-1 shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
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
                "Save Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
