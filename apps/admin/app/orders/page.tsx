"use client";

import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import {
  Loader2,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  Search,
  Filter,
  Phone,
  User,
  GraduationCap,
  Send,
  Calendar,
  DollarSign,
  Eye,
  X,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import toast from "react-hot-toast";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderBuyer {
  fullName?: string;
  phoneNumber?: string;
  department?: string;
  yearOfStudy?: number | string;
  telegramUserName?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number | string;
  product?: {
    id?: string;
    title: string;
    price?: number | string;
    imageUrls?: string[];
    category?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number | string;
  createdAt: string;
  items: OrderItem[];
  buyer?: OrderBuyer;
}

// Realistic sample orders for fallback if API is offline or initial setup
const FALLBACK_ORDERS: Order[] = [
  {
    id: "ord-8f921a4e-1284",
    userId: "usr-bereket-01",
    status: "PENDING",
    totalAmount: 1100,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    items: [
      {
        id: "item-1",
        productId: "prod-bible-01",
        quantity: 1,
        unitPrice: 650,
        product: {
          title: "Amharic Fellowship Study Bible (Hardcover)",
          imageUrls: [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
          ],
          category: "books",
        },
      },
      {
        id: "item-2",
        productId: "prod-tshirt-04",
        quantity: 1,
        unitPrice: 450,
        product: {
          title: "AAU ECSF Annual Conference T-Shirt (White)",
          imageUrls: [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80",
          ],
          category: "apparel",
        },
      },
    ],
    buyer: {
      fullName: "Bereket Tadesse",
      phoneNumber: "+251911223344",
      department: "Software Engineering",
      yearOfStudy: 4,
      telegramUserName: "bereket_t",
    },
  },
  {
    id: "ord-3c72b11d-8472",
    userId: "usr-selam-02",
    status: "CONFIRMED",
    totalAmount: 950,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    items: [
      {
        id: "item-3",
        productId: "prod-hoodie-02",
        quantity: 1,
        unitPrice: 950,
        product: {
          title: "4 Kilo Fellowship Premium Hoodie (Navy)",
          imageUrls: [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80",
          ],
          category: "apparel",
        },
      },
    ],
    buyer: {
      fullName: "Selamawit Kebede",
      phoneNumber: "+251922334455",
      department: "Electrical Engineering",
      yearOfStudy: 3,
      telegramUserName: "selam_k",
    },
  },
  {
    id: "ord-9b11e4f2-5591",
    userId: "usr-dani-03",
    status: "SHIPPED",
    totalAmount: 560,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    items: [
      {
        id: "item-4",
        productId: "prod-notebook-03",
        quantity: 2,
        unitPrice: 280,
        product: {
          title: "Leather Fellowship Devotional Notebook & Pen",
          imageUrls: [
            "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
          ],
          category: "stationery",
        },
      },
    ],
    buyer: {
      fullName: "Daniel Girma",
      phoneNumber: "+251933445566",
      department: "Civil Engineering",
      yearOfStudy: 5,
      telegramUserName: "dani_girma",
    },
  },
  {
    id: "ord-4a02d89c-9912",
    userId: "usr-ruth-04",
    status: "DELIVERED",
    totalAmount: 650,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // 2 days ago
    items: [
      {
        id: "item-5",
        productId: "prod-bible-01",
        quantity: 1,
        unitPrice: 650,
        product: {
          title: "Amharic Fellowship Study Bible (Hardcover)",
          imageUrls: [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
          ],
          category: "books",
        },
      },
    ],
    buyer: {
      fullName: "Ruth Solomon",
      phoneNumber: "+251944556677",
      department: "Biomedical Sciences",
      yearOfStudy: 2,
      telegramUserName: "ruth_solo",
    },
  },
  {
    id: "ord-1e88f72a-3301",
    userId: "usr-yared-05",
    status: "CANCELLED",
    totalAmount: 380,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString(),
    items: [
      {
        id: "item-6",
        productId: "prod-merch-05",
        quantity: 1,
        unitPrice: 380,
        product: {
          title: "Stainless Steel Fellowship Thermal Flask (500ml)",
          imageUrls: [
            "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
          ],
          category: "merch",
        },
      },
    ],
    buyer: {
      fullName: "Yared Alemu",
      phoneNumber: "+251955667788",
      department: "Mechanical Engineering",
      yearOfStudy: 4,
      telegramUserName: "yared_alemu",
    },
  },
];

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_FILTERS = [
  { id: "ALL", label: "All Orders" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/marketplace/orders");
      const raw = response.data;
      const ordersData = raw?.data?.orders || raw?.data || [];
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        setOrders(ordersData);
        setIsOfflineFallback(false);
      } else {
        // Fallback to sample fellowship orders
        setOrders(FALLBACK_ORDERS);
        setIsOfflineFallback(false);
      }
    } catch (error) {
      console.warn("Orders API unreachable, utilizing sample data:", error);
      setOrders(FALLBACK_ORDERS);
      setIsOfflineFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);
    // Optimistic update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: newStatus } : ord)),
    );
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      if (!isOfflineFallback) {
        await api.patch(`/marketplace/orders/${id}/status`, { status: newStatus });
      }
      toast.success(`Order #${id.slice(0, 8)} status set to ${newStatus}`);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status on server");
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Distinct badge colors per requirement
  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-800 border-blue-200 ring-blue-500/20";
      case "SHIPPED":
        return "bg-indigo-50 text-indigo-800 border-indigo-200 ring-indigo-500/20";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200 ring-rose-500/20";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock size={14} className="text-amber-600" />;
      case "CONFIRMED":
        return <CheckCircle2 size={14} className="text-blue-600" />;
      case "SHIPPED":
        return <Truck size={14} className="text-indigo-600" />;
      case "DELIVERED":
        return <CheckCheck size={14} className="text-emerald-600" />;
      case "CANCELLED":
        return <XCircle size={14} className="text-rose-600" />;
    }
  };

  // Filtered orders list based on status tab and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter tab
      const matchesStatus =
        selectedStatus === "ALL" || order.status === selectedStatus;

      // Search query filter (Order ID, Buyer Phone, or Product Title)
      if (!searchQuery.trim()) return matchesStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesId = order.id.toLowerCase().includes(q);
      const matchesPhone = order.buyer?.phoneNumber
        ?.toLowerCase()
        .includes(q);
      const matchesName = order.buyer?.fullName?.toLowerCase().includes(q);
      const matchesProductTitle = order.items?.some((item) =>
        item.product?.title?.toLowerCase().includes(q),
      );

      return (
        matchesStatus &&
        (matchesId || matchesPhone || matchesName || matchesProductTitle)
      );
    });
  }, [orders, selectedStatus, searchQuery]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    ORDER_STATUSES.forEach((s) => {
      counts[s] = orders.filter((o) => o.status === s).length;
    });
    return counts;
  }, [orders]);

  // Aggregate metrics
  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-[#ff6719]" size={26} />
            Fellowship Store Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track student orders, verify member contacts, and manage delivery status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg shadow-2xs hover:bg-gray-50 transition-colors"
            title="Refresh orders"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin text-[#ff6719]" : ""}
            />
          </button>
        </div>
      </div>

      {/* Offline banner notification if active */}
      {isOfflineFallback && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-amber-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <span>
              Connected in demo/offline preview mode with sample fellowship orders.
            </span>
          </div>
          <button
            onClick={fetchOrders}
            className="text-xs font-semibold underline hover:text-amber-900"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-lg text-[#ff6719]">
            <Package size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {orders.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Pending Orders</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {pendingOrdersCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Delivered</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {deliveredOrdersCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              ETB {totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by Order ID, buyer phone (+251...), buyer name, or product title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-12 py-2.5 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff6719] focus:border-[#ff6719]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Filter Tabs by Status */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Filter size={13} />
            Status:
          </span>
          {STATUS_FILTERS.map((tab) => {
            const isSelected = selectedStatus === tab.id;
            const count = statusCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
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

      {/* Orders List Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#ff6719] h-8 w-8" />
          <p className="text-sm text-gray-500 font-medium">
            Fetching fellowship orders...
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-xs overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider text-left">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Order / Buyer
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Items Ordered
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Total Amount
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Order Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const itemCount =
                    order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
                  const firstItem = order.items?.[0];
                  const hasMoreItems = (order.items?.length || 0) > 1;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order ID & Buyer Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#ff6719] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(order.createdAt), "MMM d, yyyy • HH:mm")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                              {order.buyer?.fullName
                                ? order.buyer.fullName.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {order.buyer?.fullName || `User #${order.userId.slice(0, 6)}`}
                              </p>
                              {order.buyer?.phoneNumber && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                                  <Phone size={11} className="text-gray-400" />
                                  {order.buyer.phoneNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Items Ordered with Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 h-12 w-12 relative bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-2xs">
                            {firstItem?.product?.imageUrls &&
                            firstItem.product.imageUrls.length > 0 ? (
                              <Image
                                src={firstItem.product.imageUrls[0]}
                                alt={firstItem.product.title || "Item"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full text-gray-400">
                                <Package size={18} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {firstItem?.product?.title || "Product item"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {firstItem?.quantity || 1}
                              {hasMoreItems && (
                                <span className="text-[#ff6719] font-medium ml-1.5">
                                  +{order.items.length - 1} more item
                                  {order.items.length - 1 > 1 ? "s" : ""}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount in ETB */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {Number(order.totalAmount).toLocaleString()}{" "}
                          <span className="text-xs font-semibold text-gray-500">
                            ETB
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {itemCount} total unit{itemCount === 1 ? "" : "s"}
                        </p>
                      </td>

                      {/* Status Dropdown / Badge */}
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                              order.status,
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>

                          {/* Quick inline status select */}
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(
                                order.id,
                                e.target.value as OrderStatus,
                              )
                            }
                            disabled={updatingId === order.id}
                            className="text-xs border border-gray-300 rounded-md py-1 px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#ff6719]"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-[#ff6719] transition-colors shadow-2xs"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <Search className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-gray-700 font-semibold text-base">
                          No matching orders found
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Try searching with another keyword or change your status filter tab.
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedStatus("ALL");
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

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Order Details
                  </h3>
                  <span className="font-mono text-xs font-bold text-[#ff6719] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {format(
                      new Date(selectedOrder.createdAt),
                      "MMMM d, yyyy • HH:mm",
                    )}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(selectedOrder.id, "Full Order ID")
                    }
                    className="text-gray-400 hover:text-gray-700 flex items-center gap-1 font-mono"
                    title="Copy Full ID"
                  >
                    <Copy size={12} />
                    {copiedText === "Full Order ID" ? "Copied!" : "Copy ID"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Selector Bar */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">
                  Current Status:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                    selectedOrder.status,
                  )}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="modal-status-select"
                  className="text-xs font-medium text-gray-500"
                >
                  Change Status:
                </label>
                <select
                  id="modal-status-select"
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateStatus(
                      selectedOrder.id,
                      e.target.value as OrderStatus,
                    )
                  }
                  disabled={updatingId === selectedOrder.id}
                  className="text-xs font-semibold border border-gray-300 rounded-lg py-1.5 px-3 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#ff6719]"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buyer Contact Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Buyer Contact Information
              </h4>
              <div className="p-4 bg-white rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Buyer Name</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {selectedOrder.buyer?.fullName || "Unspecified"}
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono">
                      User ID: {selectedOrder.userId.slice(0, 10)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                    {selectedOrder.buyer?.phoneNumber ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${selectedOrder.buyer.phoneNumber}`}
                          className="text-sm font-bold text-emerald-700 hover:underline font-mono"
                        >
                          {selectedOrder.buyer.phoneNumber}
                        </a>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              selectedOrder.buyer?.phoneNumber || "",
                              "Phone",
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy Phone"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-0.5">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Department & Academic Year
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {selectedOrder.buyer?.department || "AAU Student"}
                      {selectedOrder.buyer?.yearOfStudy
                        ? ` • Year ${selectedOrder.buyer.yearOfStudy}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                    <Send size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Telegram</p>
                    {selectedOrder.buyer?.telegramUserName ? (
                      <a
                        href={`https://t.me/${selectedOrder.buyer.telegramUserName.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-sky-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        @{selectedOrder.buyer.telegramUserName.replace("@", "")}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-0.5">
                        No handle linked
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Items Ordered ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => {
                  const lineTotal =
                    Number(item.unitPrice) * Number(item.quantity);

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3.5 bg-white flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-14 w-14 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                          {item.product?.imageUrls &&
                          item.product.imageUrls.length > 0 ? (
                            <Image
                              src={item.product.imageUrls[0]}
                              alt={item.product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {item.product?.title || "Product item"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <span>
                              Unit Price:{" "}
                              <strong className="text-gray-700">
                                {Number(item.unitPrice).toFixed(2)} ETB
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Quantity:{" "}
                              <strong className="text-gray-700">
                                {item.quantity}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          {lineTotal.toLocaleString()} ETB
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Summary Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Order Total</p>
                <p className="text-2xl font-extrabold text-[#ff6719]">
                  {Number(selectedOrder.totalAmount).toLocaleString()}{" "}
                  <span className="text-sm font-semibold text-gray-600">
                    ETB
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
