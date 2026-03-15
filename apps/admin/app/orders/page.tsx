"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Package, Check, Truck, XCircle, Search } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product?: {
    title: string;
    imageUrls?: string[];
  };
}

interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/marketplace/orders");
      const raw = response.data;
      const ordersData = raw?.data?.orders || raw?.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/marketplace/orders/${id}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status");
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-800 border-blue-200",
    SHIPPED: "bg-purple-50 text-purple-800 border-purple-200",
    DELIVERED: "bg-green-50 text-green-800 border-green-200",
    CANCELLED: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage fellowship store orders
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#ff6719]" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 p-2 bg-gray-50 rounded-full border">
                        <Package className="text-gray-400" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#ff6719] font-mono">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-base font-semibold text-gray-900 mt-0.5">
                          {order.items && order.items.length > 0
                            ? `${order.items[0].product?.title || "Unknown Product"}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}`
                            : "No items"}
                        </p>
                        <div className="flex mt-1 text-xs text-gray-500 gap-3">
                          <span>
                            User ID:{" "}
                            <span className="font-mono text-gray-600">
                              {order.userId.slice(0, 8)}...
                            </span>
                          </span>
                          <span>
                            {format(
                              new Date(order.createdAt),
                              "MMM d, yyyy HH:mm",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm font-semibold text-gray-900 text-right">
                        ${Number(order.totalAmount).toFixed(2)}
                        <p className="text-xs text-gray-500 font-normal">
                          {order.items?.length || 0} item(s)
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="text-xs text-gray-500">Update Status:</div>
                    <div className="flex bg-gray-50 p-1 rounded-md border border-gray-200">
                      {[
                        "PENDING",
                        "CONFIRMED",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELLED",
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(order.id, status)}
                          disabled={order.status === status}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${order.status === status ? "bg-white shadow-sm text-gray-900 border border-gray-200" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {orders.length === 0 && (
              <li className="px-4 py-12 text-center">
                <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-lg">
                  No orders found
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  When users purchase products, orders will appear here.
                </p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
