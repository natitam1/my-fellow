"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import {
  ShoppingBag,
  Package,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  ArrowUpDown,
  Tag,
  Check,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_PRODUCTS, MockProduct } from "@/lib/mock-data";

export interface StoreProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  shortDescription: string;
  imageUrl?: string;
  imageUrls: string[];
  createdAt?: string;
}

const CATEGORY_TABS = [
  { id: "all", label: "All Items" },
  { id: "apparel", label: "Apparel & Tees" },
  { id: "books", label: "Books & Bibles" },
  { id: "accessories", label: "Accessories" },
  { id: "stationery", label: "Stationery" },
  { id: "other", label: "Other" },
];

function transformMockProduct(p: MockProduct): StoreProduct {
  return {
    id: p._id,
    title: p.name,
    category: p.category || "other",
    price: p.price,
    stock: p.stockQuantity ?? 0,
    isActive: p.inStock ?? true,
    shortDescription: p.description || "",
    imageUrl: p.imageUrl,
    imageUrls: p.imageUrl ? [p.imageUrl] : [],
  };
}

export default function AdminStorePage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Edit dialog state
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete dialog state
  const [deletingProduct, setDeletingProduct] = useState<StoreProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create product dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    category: "apparel",
    price: "",
    stock: "",
    shortDescription: "",
    imageUrl: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/marketplace/products");
      const raw = response.data;
      const productsData = raw?.data?.products || raw?.data || [];

      if (Array.isArray(productsData) && productsData.length > 0) {
        setProducts(
          productsData.map((p: any) => ({
            id: p.id || p._id || `prod-${Math.random().toString(36).slice(2, 7)}`,
            title: p.title || p.name || "Fellowship Store Item",
            category: p.category || "other",
            price: Number(p.price) || 0,
            stock: typeof p.stock === "number" ? p.stock : (p.stockQuantity ?? 0),
            isActive: p.isActive !== undefined ? Boolean(p.isActive) : (p.inStock ?? true),
            shortDescription: p.shortDescription || p.description || "",
            imageUrl: p.imageUrls?.[0] || p.imageUrl || "",
            imageUrls: Array.isArray(p.imageUrls)
              ? p.imageUrls
              : p.imageUrl
                ? [p.imageUrl]
                : [],
            createdAt: p.createdAt,
          })),
        );
        setIsOfflineFallback(false);
      } else {
        // Fallback to MOCK_PRODUCTS from @/lib/mock-data
        setProducts(MOCK_PRODUCTS.map(transformMockProduct));
        setIsOfflineFallback(false);
      }
    } catch {
      // Offline / API error fallback to MOCK_PRODUCTS from @/lib/mock-data
      setProducts(MOCK_PRODUCTS.map(transformMockProduct));
      setIsOfflineFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Toggle active status
  const handleToggleActive = async (product: StoreProduct) => {
    const updatedStatus = !product.isActive;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: updatedStatus } : p)),
    );

    try {
      if (!isOfflineFallback) {
        await api.put(`/marketplace/products/${product.id}`, {
          isActive: updatedStatus,
        });
      }
      toast.success(
        `"${product.title}" is now ${updatedStatus ? "Active" : "Inactive"}`,
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !updatedStatus } : p,
        ),
      );
      toast.error("Could not update product active status");
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (product: StoreProduct) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    if (!editingProduct.title.trim()) {
      toast.error("Product name cannot be empty");
      return;
    }

    setSavingEdit(true);
    try {
      if (!isOfflineFallback) {
        await api.put(`/marketplace/products/${editingProduct.id}`, {
          title: editingProduct.title,
          category: editingProduct.category,
          price: editingProduct.price,
          stock: editingProduct.stock,
          shortDescription: editingProduct.shortDescription,
          isActive: editingProduct.isActive,
        });
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)),
      );
      toast.success(`Updated "${editingProduct.title}"`);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save product changes");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Delete Dialog
  const handleOpenDelete = (product: StoreProduct) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      if (!isOfflineFallback) {
        await api.delete(`/marketplace/products/${deletingProduct.id}`);
      }
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      toast.success(`Deleted "${deletingProduct.title}"`);
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Add Product
  const handleCreateProduct = async () => {
    if (!newProduct.title.trim()) {
      toast.error("Product title is required");
      return;
    }
    const priceNum = parseFloat(newProduct.price);
    const stockNum = parseInt(newProduct.stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please provide a valid price in ETB");
      return;
    }

    setCreating(true);
    try {
      const createdItem: StoreProduct = {
        id: `prod-${Date.now()}`,
        title: newProduct.title.trim(),
        category: newProduct.category,
        price: priceNum,
        stock: isNaN(stockNum) ? 0 : Math.max(0, stockNum),
        isActive: true,
        shortDescription: newProduct.shortDescription.trim(),
        imageUrl: newProduct.imageUrl.trim() || undefined,
        imageUrls: newProduct.imageUrl.trim() ? [newProduct.imageUrl.trim()] : [],
      };

      if (!isOfflineFallback) {
        await api.post("/marketplace/products", {
          title: createdItem.title,
          category: createdItem.category,
          price: createdItem.price,
          stock: createdItem.stock,
          shortDescription: createdItem.shortDescription,
          imageUrls: createdItem.imageUrls,
        });
      }

      setProducts((prev) => [createdItem, ...prev]);
      toast.success(`Product "${createdItem.title}" created successfully`);
      setIsAddDialogOpen(false);
      setNewProduct({
        title: "",
        category: "apparel",
        price: "",
        stock: "",
        shortDescription: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create product");
    } finally {
      setCreating(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!products.length) {
      toast.info("No product records to export");
      return;
    }

    const headers = [
      "ID",
      "Product Name",
      "Category",
      "Price (ETB)",
      "Stock Quantity",
      "Stock Status",
      "Active Status",
      "Short Description",
    ];

    const rows = products.map((p) => {
      const stockStatus =
        p.stock <= 0
          ? "Out of Stock"
          : p.stock <= 5
            ? "Low Stock"
            : "In Stock";

      return [
        `"${p.id}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.price,
        p.stock,
        `"${stockStatus}"`,
        p.isActive ? "Active" : "Inactive",
        `"${(p.shortDescription || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fellowship_store_inventory_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Store inventory CSV exported successfully");
  };

  // Filter products by category tab
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [products, selectedCategory]);

  // Aggregate stats
  const totalProducts = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case "apparel":
      case "t-shirt":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      case "hoodie":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      case "books":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      case "accessories":
      case "soap":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      case "stationery":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // TanStack Columns definition
  const columns = useMemo<ColumnDef<StoreProduct>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-semibold hover:bg-muted"
            >
              Product Name
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const product = row.original;
          const displayImage = product.imageUrl || product.imageUrls?.[0];

          return (
            <div className="flex items-center gap-3.5 py-1">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 max-w-[280px]">
                <p className="truncate text-sm font-semibold text-foreground">
                  {product.title}
                </p>
                {product.shortDescription && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {product.shortDescription}
                  </p>
                )}
                <span className="font-mono text-[10px] text-muted-foreground">
                  ID: {product.id.slice(0, 10)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const cat = row.getValue("category") as string;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getCategoryBadgeClass(
                cat || "other",
              )}`}
            >
              <Tag className="mr-1 h-3 w-3 opacity-70" />
              {cat || "other"}
            </span>
          );
        },
      },
      {
        accessorKey: "price",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-semibold hover:bg-muted"
            >
              Price
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const price = Number(row.getValue("price")) || 0;
          return (
            <div className="whitespace-nowrap text-sm font-semibold text-foreground">
              {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
              <span className="text-xs font-medium text-primary">ETB</span>
            </div>
          );
        },
      },
      {
        accessorKey: "stock",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-semibold hover:bg-muted"
            >
              Stock Qty
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const stock = Number(row.getValue("stock")) || 0;
          return (
            <span className="font-mono text-sm font-medium text-foreground">
              {stock} units
            </span>
          );
        },
      },
      {
        id: "stockStatus",
        header: "Stock Status",
        cell: ({ row }) => {
          const stock = row.original.stock;
          if (stock <= 0) {
            return (
              <Badge
                variant="outline"
                className="gap-1 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 font-medium text-xs"
              >
                <XCircle className="h-3 w-3" />
                Out of Stock
              </Badge>
            );
          }
          if (stock <= 5) {
            return (
              <Badge
                variant="outline"
                className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400 font-medium text-xs"
              >
                <AlertTriangle className="h-3 w-3" />
                Low Stock
              </Badge>
            );
          }
          return (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium text-xs"
            >
              <CheckCircle2 className="h-3 w-3" />
              In Stock
            </Badge>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={product.isActive}
                onCheckedChange={() => handleToggleActive(product)}
                aria-label={`Toggle active status for ${product.title}`}
              />
              <span className="text-xs text-muted-foreground">
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenEdit(product)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Edit Product"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-xs">Product Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleOpenEdit(product)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleActive(product)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                    Set {product.isActive ? "Inactive" : "Active"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleOpenDelete(product)}
                    className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products],
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Fellowship Store & Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage student merchandise, Bibles, Christian literature, and store stock
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={loading}
            className="h-9 gap-1.5"
            title="Refresh Inventory"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 gap-1.5"
          >
            <Link href="/admin/orders">
              <Package className="h-4 w-4 text-primary" />
              Manage Orders
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Offline banner notification if active */}
      {isOfflineFallback && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 p-3.5 rounded-xl flex items-center justify-between text-amber-800 dark:text-amber-300 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Connected in demo preview mode. Displaying centralized fellowship store catalog.
            </span>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={fetchProducts}
            className="text-xs font-semibold text-amber-900 dark:text-amber-200 underline h-auto p-0"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/40 text-primary rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Products</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{totalProducts}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Listings</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{activeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Units in Stock</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{totalUnits}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{outOfStockCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Categories:</span>
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
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* TanStack DataTable */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchKey="title"
        searchPlaceholder="Search store products by name..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No products match your current search or category filter."
      />

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit className="h-4 w-4 text-primary" />
              Edit Store Product
            </DialogTitle>
            <DialogDescription>
              Update item specifications, retail price in ETB, and available inventory.
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-title">Product Name</Label>
                <Input
                  id="edit-title"
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, title: e.target.value })
                  }
                  placeholder="e.g. 4 Kilo Fellowship Heritage Hoodie"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingProduct.category}
                    onValueChange={(val) =>
                      setEditingProduct({ ...editingProduct, category: val })
                    }
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apparel">Apparel</SelectItem>
                      <SelectItem value="books">Books & Bibles</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="stationery">Stationery</SelectItem>
                      <SelectItem value="other">Other Merchandise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="edit-price">Price (ETB)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="1"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-stock">Stock Quantity</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col justify-end gap-1.5">
                  <Label htmlFor="edit-active">Active in Catalog</Label>
                  <div className="flex items-center gap-2 h-9">
                    <Switch
                      id="edit-active"
                      checked={editingProduct.isActive}
                      onCheckedChange={(checked) =>
                        setEditingProduct({ ...editingProduct, isActive: checked })
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {editingProduct.isActive ? "Visible to members" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="edit-desc">Short Description</Label>
                <Textarea
                  id="edit-desc"
                  rows={3}
                  value={editingProduct.shortDescription}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="Provide context, fabric specifications, or ministry details..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                &ldquo;{deletingProduct?.title}&rdquo;
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Plus className="h-4 w-4 text-primary" />
              Add New Store Product
            </DialogTitle>
            <DialogDescription>
              Create merchandise, books, or ministry supplies for 4 Kilo fellowship members.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="add-title">Product Name *</Label>
              <Input
                id="add-title"
                value={newProduct.title}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, title: e.target.value })
                }
                placeholder="e.g. AAU ECSF Conference T-Shirt"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="add-category">Category</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(val) =>
                    setNewProduct({ ...newProduct, category: val })
                  }
                >
                  <SelectTrigger id="add-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="books">Books & Bibles</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                    <SelectItem value="other">Other Merchandise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="add-price">Price (ETB) *</Label>
                <Input
                  id="add-price"
                  type="number"
                  min="0"
                  step="1"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  placeholder="e.g. 750"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="add-stock">Stock Quantity</Label>
                <Input
                  id="add-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  placeholder="e.g. 50"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="add-image">Image URL (Optional)</Label>
                <Input
                  id="add-image"
                  value={newProduct.imageUrl}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="add-desc">Short Description</Label>
              <Textarea
                id="add-desc"
                rows={3}
                value={newProduct.shortDescription}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    shortDescription: e.target.value,
                  })
                }
                placeholder="Product description, sizing, or ministry dedication..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProduct}
              disabled={creating}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {creating ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
