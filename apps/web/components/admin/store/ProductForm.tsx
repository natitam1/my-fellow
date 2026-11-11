"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loader2, Upload, X, Link as LinkIcon, Plus } from "lucide-react";

export interface ProductData {
  id?: string;
  _id?: string;
  title?: string;
  shortDescription?: string;
  price?: number | string;
  category?: string;
  stock?: number | string;
  imageUrls?: string[];
  isActive?: boolean;
}

interface ProductFormProps {
  initialData?: ProductData | null;
}

const CATEGORIES = [
  { value: "t-shirt", label: "T-Shirts" },
  { value: "hoodie", label: "Hoodies" },
  { value: "soap", label: "Natural Soap" },
  { value: "stickers", label: "Stickers" },
  { value: "accessories", label: "Accessories" },
  { value: "others", label: "Other Merchandise" },
];

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const productId = initialData?.id || initialData?._id;
  const isEditing = Boolean(productId);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Existing images (URLs already stored on server)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // Direct external image URLs entered by admin
  const [urlImages, setUrlImages] = useState<string[]>([]);
  // Input for adding direct URL
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  // New local files selected by user
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Form values
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    price: "",
    category: "",
    stock: "10",
    isActive: true,
  });

  // Inline field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        shortDescription: initialData.shortDescription || "",
        price: initialData.price !== undefined ? String(initialData.price) : "",
        category: initialData.category || "",
        stock: initialData.stock !== undefined ? String(initialData.stock) : "10",
        isActive:
          initialData.isActive !== undefined ? Boolean(initialData.isActive) : true,
      });
      setExistingImages(initialData.imageUrls || []);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);

      const previews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previews]);

      if (errors.images) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.images;
          return next;
        });
      }
    }
  };

  const handleAddUrlImage = () => {
    setUrlError("");
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError("Please enter an image URL");
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setUrlError("URL must begin with http:// or https://");
        return;
      }
    } catch {
      setUrlError("Please enter a valid URL (e.g. https://example.com/photo.jpg)");
      return;
    }

    if (existingImages.includes(trimmed) || urlImages.includes(trimmed)) {
      setUrlError("This image URL has already been added");
      return;
    }

    setUrlImages((prev) => [...prev, trimmed]);
    setUrlInput("");
    if (errors.images) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUrlImage = (index: number) => {
    setUrlImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = "Product title must be at least 3 characters long.";
    } else if (formData.title.length > 100) {
      newErrors.title = "Product title must not exceed 100 characters.";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Please select a product category.";
    }

    if (
      !formData.shortDescription.trim() ||
      formData.shortDescription.trim().length < 5
    ) {
      newErrors.shortDescription =
        "Description must be at least 5 characters long.";
    } else if (formData.shortDescription.length > 300) {
      newErrors.shortDescription =
        "Description must not exceed 300 characters.";
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Price must be a valid positive number in ETB.";
    }

    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = "Stock must be a non-negative integer (0 or more).";
    }

    const totalImages =
      existingImages.length + urlImages.length + newImages.length;
    if (totalImages === 0) {
      newErrors.images = "At least one product image (upload or URL) is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please resolve the highlighted validation errors.");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", formData.title.trim());
      form.append("shortDescription", formData.shortDescription.trim());
      form.append("price", String(formData.price));
      form.append("category", formData.category);
      form.append("stock", String(formData.stock));
      form.append("isActive", String(formData.isActive));

      // Append new file uploads
      newImages.forEach((file) => {
        form.append("images", file);
      });

      // Combine existing images and newly added URL images
      const allUrlImages = [...existingImages, ...urlImages];
      allUrlImages.forEach((url) => {
        form.append("imageUrls", url);
      });

      const onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      };

      if (isEditing && productId) {
        await api.put(`/marketplace/products/${productId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress,
          transformRequest: [
            (data, headers) => {
              delete headers["Content-Type"];
              return data;
            },
          ],
        });
      } else {
        await api.post("/marketplace/products", form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress,
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
          ? "Product updated successfully!"
          : "Product created successfully!",
      );
      router.push("/admin/store");
      router.refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to save product. Ensure all required fields are valid.";
      console.error("Product save error:", error.response?.data || error);
      toast.error(message);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const totalImageCount =
    existingImages.length + urlImages.length + newImages.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto py-6">
      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-4">
          {isEditing ? "Edit Product" : "Create New Product"}
        </h3>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* PRODUCT IMAGES SECTION */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Product Images <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">
                {totalImageCount} image{totalImageCount === 1 ? "" : "s"} added
              </span>
            </div>

            {/* If any images exist, show thumbnail gallery */}
            {totalImageCount > 0 && (
              <div className="mt-2 flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {/* Existing Server Images */}
                {existingImages.map((url, i) => (
                  <div
                    key={`exist-${i}`}
                    className="relative h-20 w-20 bg-white rounded-md overflow-hidden border border-gray-200 group"
                  >
                    <Image
                      src={url}
                      alt={`Product photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] text-white px-1 py-0.5 rounded">
                      Saved
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 bg-white/90 text-gray-700 rounded-full p-1 shadow-xs hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Direct URL Images */}
                {urlImages.map((url, i) => (
                  <div
                    key={`url-${i}`}
                    className="relative h-20 w-20 bg-white rounded-md overflow-hidden border border-gray-200 group"
                  >
                    <Image
                      src={url}
                      alt={`URL photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-blue-600/80 text-[9px] text-white px-1 py-0.5 rounded">
                      URL
                    </span>
                    <button
                      type="button"
                      onClick={() => removeUrlImage(i)}
                      className="absolute top-1 right-1 bg-white/90 text-gray-700 rounded-full p-1 shadow-xs hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Newly Uploaded Files */}
                {newImagePreviews.map((preview, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative h-20 w-20 bg-white rounded-md overflow-hidden border border-gray-200 group"
                  >
                    <Image
                      src={preview}
                      alt={`New upload ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-[#ff6719]/90 text-[9px] text-white px-1 py-0.5 rounded">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-white/90 text-gray-700 rounded-full p-1 shadow-xs hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Dashed dropzone matching EventForm */}
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:border-[#ff6719] transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="product-file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6719] hover:text-[#e55a15] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#ff6719] px-2 py-0.5"
                  >
                    <span>Upload files</span>
                    <input
                      id="product-file-upload"
                      name="product-file-upload"
                      type="file"
                      multiple
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 10MB
                </p>
              </div>
            </div>

            {/* Add Image URL Input Row */}
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <LinkIcon size={16} />
                </div>
                <input
                  type="url"
                  placeholder="Or paste an image URL (https://...)"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrlImage();
                    }
                  }}
                  className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 pl-9 pr-3 border bg-white outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddUrlImage}
                className="bg-white py-2 px-5 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={15} />
                Add URL
              </button>
            </div>
            {urlError && (
              <p className="text-xs text-red-500 mt-1 pl-1">{urlError}</p>
            )}
            {errors.images && (
              <p className="text-xs text-red-500 mt-1 pl-1">{errors.images}</p>
            )}
          </div>

          {/* Product Title */}
          <div className="sm:col-span-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Product Title *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 4 Kilo Fellowship Classic Tee"
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
              />
            </div>
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-6">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category *
            </label>
            <div className="mt-1">
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white outline-none cursor-pointer"
              >
                <option value="" disabled>
                  Select category...
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Short Description */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center">
              <label
                htmlFor="shortDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Short Description *
              </label>
              <span className="text-xs text-gray-400">
                {formData.shortDescription.length}/300
              </span>
            </div>
            <div className="mt-1">
              <textarea
                name="shortDescription"
                id="shortDescription"
                rows={3}
                required
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief description of material, design, sizing, or ministry edition..."
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
              />
            </div>
            {errors.shortDescription && (
              <p className="text-xs text-red-500 mt-1">
                {errors.shortDescription}
              </p>
            )}
          </div>

          {/* Price (ETB) */}
          <div className="sm:col-span-3">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price (ETB) *
            </label>
            <div className="mt-1">
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                id="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 650.00"
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
              />
            </div>
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          {/* Stock */}
          <div className="sm:col-span-3">
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Stock Quantity *
            </label>
            <div className="mt-1">
              <input
                type="number"
                min="0"
                name="stock"
                id="stock"
                required
                value={formData.stock}
                onChange={handleChange}
                placeholder="e.g. 50"
                className="shadow-sm focus:ring-[#ff6719] focus:border-[#ff6719] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
              />
            </div>
            {errors.stock && (
              <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="sm:col-span-6 border-t pt-4">
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="focus:ring-[#ff6719] h-4 w-4 text-[#ff6719] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="isActive"
                  className="font-medium text-gray-700 cursor-pointer"
                >
                  Publish to Fellowship Store
                </label>
                <p className="text-gray-500">
                  When enabled, this item is visible to all members in the mobile fellowship store.
                </p>
              </div>
            </div>
          </div>
        </div>

        {uploadProgress !== null && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full space-y-1 pt-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>Uploading images...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#ff6719] h-full rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons: Fully rounded pills matching EventForm */}
        <div className="pt-5 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-6 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6719] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-[#ff6719] hover:bg-[#e55a15] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6719] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>
                    {uploadProgress !== null && uploadProgress < 100
                      ? `Uploading (${uploadProgress}%)...`
                      : isEditing
                        ? "Updating..."
                        : "Publishing..."}
                  </span>
                </span>
              ) : isEditing ? (
                "Update Product"
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
