"use client";

import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Package,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Layers,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  price: string | number;
  imageUrls: string[];
  category: string;
  stock: number;
  isActive?: boolean;
}

// Curated fellowship store items
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-tee-01",
    title: "4 Kilo Fellowship Classic Tee",
    shortDescription:
      "Signature 100% heavy combed cotton tee featuring the 4 Kilo ECSF emblem and 'Rooted & Built Up in Christ' (Colossians 2:6-7).",
    price: 650,
    imageUrls: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    ],
    category: "t-shirt",
    stock: 50,
    isActive: true,
  },
  {
    id: "prod-hoodie-02",
    title: "4 Kilo Fellowship Heavyweight Hoodie",
    shortDescription:
      "Cozy 400 GSM brushed fleece pullover hoodie with embroidered 4 Kilo Christian Fellowship chest insignia. Built warm for Addis Ababa mornings and campus prayer nights.",
    price: 1500,
    imageUrls: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    ],
    category: "hoodie",
    stock: 35,
    isActive: true,
  },
  {
    id: "prod-soap-03",
    title: "Fellowship Ministry Natural Olive & Honey Soap",
    shortDescription:
      "Handcrafted organic cold-processed bar soap made with Ethiopian honey, pure virgin olive oil, and calming lavender essential oil. All proceeds support campus outreach ministries.",
    price: 150,
    imageUrls: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
    ],
    category: "soap",
    stock: 100,
    isActive: true,
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "All Items" },
  { id: "t-shirt", label: "T-Shirts" },
  { id: "hoodie", label: "Hoodies" },
  { id: "soap", label: "Natural Soap" },
  { id: "stickers", label: "Stickers" },
  { id: "accessories", label: "Accessories" },
  { id: "others", label: "Other Merchandise" },
];

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/marketplace/products");
      const raw = response.data;
      const productsData = raw?.data?.products || raw?.data || [];
      if (Array.isArray(productsData) && productsData.length > 0) {
        setProducts(
          productsData.map((p: any) => ({
            ...p,
            isActive: p.isActive !== undefined ? p.isActive : true,
          })),
        );
        setIsOfflineFallback(false);
      } else {
        // Fallback to initial sample items if empty
        setProducts(FALLBACK_PRODUCTS);
        setIsOfflineFallback(false);
      }
    } catch (error) {
      console.warn("Products API unreachable, using sample data:", error);
      setProducts(FALLBACK_PRODUCTS);
      setIsOfflineFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Toggle active status
  const handleToggleActive = async (product: Product) => {
    const newStatus = product.isActive === false ? true : false;
    setTogglingId(product.id);

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: newStatus } : p)),
    );

    try {
      if (!isOfflineFallback) {
        await api.put(`/marketplace/products/${product.id}`, {
          isActive: newStatus,
        });
      }
      toast.success(
        `"${product.title}" is now ${newStatus ? "Active" : "Inactive"}`,
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !newStatus } : p,
        ),
      );
      toast.error("Could not update product active status");
    } finally {
      setTogglingId(null);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      if (!isOfflineFallback) {
        await api.delete(`/marketplace/products/${productToDelete.id}`);
      }
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success(`Deleted "${productToDelete.title}"`);
      setProductToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Stock filter
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && product.stock > 0) ||
        (stockFilter === "out_of_stock" && product.stock <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Quick stats
  const totalItems = products.length;
  const activeCount = products.filter((p) => p.isActive !== false).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const categoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "t-shirt":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "hoodie":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "soap":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "stickers":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "accessories":
        return "bg-orange-50 text-[#ff6719] border-orange-200";
      case "others":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-[#ff6719]" size={26} />
            Fellowship Store & Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage merchandise, Bibles, literature, and fellowship store items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg shadow-2xs hover:bg-gray-50 transition-colors"
            title="Refresh inventory"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#ff6719]" : ""} />
          </button>
          <Link
            href="/orders"
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-2xs transition-colors gap-2"
          >
            <Package size={18} className="text-[#ff6719]" />
            Manage Orders
          </Link>
          <Link
            href="/store/new"
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#ff6719] hover:bg-[#e55a15] transition-colors gap-2"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Offline banner notification if active */}
      {isOfflineFallback && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-amber-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <span>
              Connected in demo/offline preview mode. Showing sample fellowship store items.
            </span>
          </div>
          <button
            onClick={fetchProducts}
            className="text-xs font-semibold underline hover:text-amber-900"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-lg text-[#ff6719]">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Products</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{totalItems}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Active Listings</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Units in Stock</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{totalStockUnits}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Out of Stock</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by title, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6719] focus:border-[#ff6719]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Stock inventory status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
              Stock:
            </span>
            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(
                  e.target.value as "all" | "in_stock" | "out_of_stock",
                )
              }
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#ff6719]"
            >
              <option value="all">All Inventory</option>
              <option value="in_stock">In Stock (&gt; 0)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Filter size={13} />
            Categories:
          </span>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            const count =
              tab.id === "all"
                ? products.length
                : products.filter(
                    (p) => p.category?.toLowerCase() === tab.id.toLowerCase(),
                  ).length;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[#ff6719] text-white shadow-2xs font-semibold"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table / List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#ff6719] h-8 w-8" />
          <p className="text-sm text-gray-500 font-medium">
            Loading store inventory...
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-xs overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider text-left">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Price (ETB)
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Inventory Stock
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Active Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const isActive = product.isActive !== false;
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isOutOfStock = product.stock <= 0;
                  const priceFormatted = Number(product.price).toFixed(2);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Thumbnail & Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="shrink-0 h-16 w-16 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-2xs">
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                              <Image
                                src={product.imageUrls[0]}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full text-gray-400">
                                <Package size={22} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {product.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {product.shortDescription}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                              ID: {product.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${categoryColor(product.category || "other")}`}
                        >
                          {product.category || "other"}
                        </span>
                      </td>

                      {/* Price in ETB */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {priceFormatted} <span className="text-xs font-medium text-gray-500">ETB</span>
                        </div>
                      </td>

                      {/* Stock Count with Status Badges */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-md inline-flex items-center gap-1 border ${
                              isOutOfStock
                                ? "bg-red-50 text-red-700 border-red-200"
                                : isLowStock
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isOutOfStock ? (
                              <XCircle size={13} />
                            ) : isLowStock ? (
                              <AlertTriangle size={13} />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            {product.stock} units
                          </span>
                          {isOutOfStock && (
                            <span className="text-[11px] font-semibold text-red-500">
                              Out of stock
                            </span>
                          )}
                          {isLowStock && (
                            <span className="text-[11px] font-semibold text-amber-600">
                              Low stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(product)}
                            disabled={togglingId === product.id}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isActive ? "bg-[#ff6719]" : "bg-gray-300"
                            }`}
                            title={
                              isActive
                                ? "Click to set inactive"
                                : "Click to set active"
                            }
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] font-semibold ${
                              isActive ? "text-[#ff6719]" : "text-gray-400"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/store/${product.id}/edit`}
                            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <Search className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-gray-700 font-semibold text-base">
                          No matching products found
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Try adjusting your search keywords, category, or inventory stock filters.
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                            setStockFilter("all");
                          }}
                          className="mt-3 text-xs font-semibold text-[#ff6719] hover:underline"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Product
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900">
                &ldquo;{productToDelete.title}&rdquo;
              </strong>
              ? This product will be permanently removed from the fellowship store.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 gap-2 shadow-xs"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
