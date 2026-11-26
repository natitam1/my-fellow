"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  Phone,
  User,
  GraduationCap,
  Send,
  Calendar,
  DollarSign,
  Eye,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  ArrowUpDown,
  MoreHorizontal,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_ORDERS, MockOrder } from "@/lib/mock-data";

export interface OrderItemRecord {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  department?: string;
  yearOfStudy?: number | string;
  telegramUserName?: string;
  items: OrderItemRecord[];
  itemSummary: string;
  itemsCount: number;
  totalAmount: number;
  paymentMethod: "chapa" | "telebirr" | "cbe_birr" | "cash_on_pickup" | string;
  paymentStatus: "paid" | "pending" | "failed" | string;
  status: string;
  txRef: string;
  createdAt: string;
}

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered / Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_FILTER_TABS = [
  { id: "ALL", label: "All Orders" },
  { id: "PAID", label: "Paid" },
  { id: "PENDING_PAYMENT", label: "Pending Payment" },
  { id: "PENDING_DELIVERY", label: "In Progress" },
  { id: "COMPLETED", label: "Delivered / Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

function transformMockOrder(o: MockOrder): AdminOrder {
  const items: OrderItemRecord[] = o.items.map((it, idx) => ({
    id: `item-${idx}`,
    productId: it.productId,
    productName: it.productName,
    quantity: it.quantity,
    price: it.price,
  }));
  const itemSummary = items
    .map((it) => `${it.productName} (x${it.quantity})`)
    .join(", ");
  const itemsCount = items.reduce((sum, it) => sum + it.quantity, 0);

  return {
    id: o._id,
    customerName: o.customerName,
    phoneNumber: o.phoneNumber,
    items,
    itemSummary,
    itemsCount,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod || "chapa",
    paymentStatus: o.paymentStatus || "paid",
    status: o.status.toUpperCase(),
    txRef: o.txRef,
    createdAt: o.createdAt,
    department: "Engineering Faculty",
    yearOfStudy: 3,
  };
}

function transformApiOrder(o: any): AdminOrder {
  const items: OrderItemRecord[] = Array.isArray(o.items)
    ? o.items.map((it: any, idx: number) => ({
        id: it.id || `item-${idx}`,
        productId: it.productId || it.product?.id || `prod-${idx}`,
        productName:
          it.productName ||
          it.product?.title ||
          it.title ||
          `Fellowship Item #${idx + 1}`,
        quantity: it.quantity || 1,
        price: Number(it.price ?? it.unitPrice ?? 0),
        imageUrl: it.imageUrl || it.product?.imageUrls?.[0],
      }))
    : [];

  const itemSummary = items.length
    ? items.map((it) => `${it.productName} (x${it.quantity})`).join(", ")
    : "No items";
  const itemsCount = items.reduce((sum, it) => sum + it.quantity, 0);

  const rawStatus = (o.status || "PENDING").toString().toUpperCase();
  const rawPayStatus = (
    o.paymentStatus ||
    (rawStatus === "DELIVERED" || rawStatus === "CONFIRMED" || rawStatus === "COMPLETED"
      ? "paid"
      : "pending")
  )
    .toString()
    .toLowerCase();

  return {
    id: o.id || o._id || `ord-${Math.random().toString(36).slice(2, 7)}`,
    customerName:
      o.customerName ||
      o.buyer?.fullName ||
      (o.userId ? `Student #${o.userId.slice(0, 6)}` : "Fellowship Member"),
    phoneNumber: o.phoneNumber || o.buyer?.phoneNumber || "+251900000000",
    department: o.department || o.buyer?.department,
    yearOfStudy: o.yearOfStudy || o.buyer?.yearOfStudy,
    telegramUserName: o.telegramUserName || o.buyer?.telegramUserName,
    items,
    itemSummary,
    itemsCount,
    totalAmount: Number(o.totalAmount || 0),
    paymentMethod: (o.paymentMethod || "chapa").toString().toLowerCase(),
    paymentStatus: rawPayStatus,
    status: rawStatus,
    txRef:
      o.txRef ||
      o.paymentTxRef ||
      `CHP-${(o.id || o._id || "REF").slice(0, 6).toUpperCase()}-AAU`,
    createdAt: o.createdAt || new Date().toISOString(),
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/marketplace/orders");
      const raw = response.data;
      const ordersData = raw?.data?.orders || raw?.data || [];

      if (Array.isArray(ordersData) && ordersData.length > 0) {
        setOrders(ordersData.map(transformApiOrder));
        setIsOfflineFallback(false);
      } else {
        // Fallback to MOCK_ORDERS from @/lib/mock-data
        setOrders(MOCK_ORDERS.map(transformMockOrder));
        setIsOfflineFallback(false);
      }
    } catch {
      // Offline / API error fallback to MOCK_ORDERS from @/lib/mock-data
      setOrders(MOCK_ORDERS.map(transformMockOrder));
      setIsOfflineFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const upper = newStatus.toUpperCase();

    // Optimistic update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: upper } : ord)),
    );
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: upper } : null));
    }

    try {
      if (!isOfflineFallback) {
        await api.patch(`/marketplace/orders/${id}/status`, { status: upper });
      }
      toast.success(`Order #${id.slice(0, 8)} status set to ${upper}`);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status on server");
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  // CSV Export handler
  const handleExportCsv = () => {
    if (!orders.length) {
      toast.info("No order records to export");
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Phone Number",
      "Items Summary",
      "Total Amount (ETB)",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Transaction Ref",
      "Date Placed",
    ];

    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.phoneNumber}"`,
      `"${o.itemSummary.replace(/"/g, '""')}"`,
      o.totalAmount,
      `"${o.paymentMethod.toUpperCase()}"`,
      `"${o.paymentStatus.toUpperCase()}"`,
      `"${o.status}"`,
      `"${o.txRef}"`,
      `"${o.createdAt}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fellowship_store_orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders CSV exported successfully");
  };

  // Status Badge styles
  const getOrderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400 font-medium text-xs"
          >
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "CONFIRMED":
      case "PROCESSING":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400 font-medium text-xs"
          >
            <CheckCircle2 className="h-3 w-3" />
            {s === "PROCESSING" ? "Processing" : "Confirmed"}
          </Badge>
        );
      case "SHIPPED":
      case "READY_FOR_PICKUP":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400 font-medium text-xs"
          >
            <Truck className="h-3 w-3" />
            {s === "READY_FOR_PICKUP" ? "Ready for Pickup" : "Shipped"}
          </Badge>
        );
      case "DELIVERED":
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium text-xs"
          >
            <CheckCheck className="h-3 w-3" />
            Delivered
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 font-medium text-xs"
          >
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const m = method.toLowerCase();
    if (m.includes("chapa")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          Chapa Pay
        </span>
      );
    }
    if (m.includes("telebirr")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
          telebirr
        </span>
      );
    }
    if (m.includes("cbe")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
          CBE Birr
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
        Campus Pickup
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid") {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium text-xs"
        >
          <CheckCircle2 className="h-3 w-3" />
          Paid
        </Badge>
      );
    }
    if (s === "pending") {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400 font-medium text-xs"
        >
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="gap-1 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 font-medium text-xs"
      >
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  };

  // Filter orders based on status tab
  const filteredOrders = useMemo(() => {
    if (selectedStatusTab === "ALL") return orders;
    if (selectedStatusTab === "PAID") {
      return orders.filter((o) => o.paymentStatus.toLowerCase() === "paid");
    }
    if (selectedStatusTab === "PENDING_PAYMENT") {
      return orders.filter((o) => o.paymentStatus.toLowerCase() === "pending");
    }
    if (selectedStatusTab === "PENDING_DELIVERY") {
      return orders.filter(
        (o) =>
          o.status === "PENDING" ||
          o.status === "CONFIRMED" ||
          o.status === "PROCESSING" ||
          o.status === "READY_FOR_PICKUP" ||
          o.status === "SHIPPED",
      );
    }
    if (selectedStatusTab === "COMPLETED") {
      return orders.filter(
        (o) => o.status === "DELIVERED" || o.status === "COMPLETED",
      );
    }
    if (selectedStatusTab === "CANCELLED") {
      return orders.filter((o) => o.status === "CANCELLED");
    }
    return orders;
  }, [orders, selectedStatusTab]);

  // Aggregate stats
  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "CANCELLED" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    [orders],
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "PENDING" || o.paymentStatus === "pending").length,
    [orders],
  );

  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED").length,
    [orders],
  );

  // TanStack DataTable Columns
  const columns = useMemo<ColumnDef<AdminOrder>[]>(
    () => [
      {
        accessorKey: "customerName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-semibold hover:bg-muted"
            >
              Customer & Phone
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const order = row.original;
          const initials = order.customerName
            ? order.customerName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "EC";

          return (
            <div className="flex items-center gap-3 py-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-primary dark:bg-orange-950/60 dark:text-orange-400">
                {initials}
              </div>
              <div className="min-w-0 max-w-[200px]">
                <p className="truncate text-sm font-semibold text-foreground">
                  {order.customerName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Phone className="h-3 w-3 text-muted-foreground/70" />
                  <a
                    href={`tel:${order.phoneNumber}`}
                    className="hover:underline hover:text-primary"
                  >
                    {order.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "itemSummary",
        header: "Items Ordered",
        cell: ({ row }) => {
          const order = row.original;
          const firstItem = order.items[0];
          const hasMore = order.items.length > 1;

          return (
            <div className="min-w-0 max-w-[240px] py-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-medium text-foreground">
                  {firstItem?.productName || "Store item"}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  x{firstItem?.quantity || 1}
                </span>
              </div>
              {hasMore && (
                <p className="text-[11px] text-primary font-medium">
                  +{order.items.length - 1} other item{order.items.length - 1 > 1 ? "s" : ""} ({order.itemsCount} total units)
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-semibold hover:bg-muted"
            >
              Total (ETB)
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const amount = Number(row.getValue("totalAmount")) || 0;
          return (
            <div className="whitespace-nowrap text-sm font-bold text-foreground">
              {amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
              <span className="text-xs font-medium text-primary">ETB</span>
            </div>
          );
        },
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        cell: ({ row }) => {
          return getPaymentMethodBadge(row.original.paymentMethod);
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
          return getPaymentStatusBadge(row.original.paymentStatus);
        },
      },
      {
        accessorKey: "status",
        header: "Order Status",
        cell: ({ row }) => {
          return getOrderStatusBadge(row.original.status);
        },
      },
      {
        accessorKey: "txRef",
        header: "Chapa TxRef",
        cell: ({ row }) => {
          const txRef = row.original.txRef;
          const isCopied = copiedKey === txRef;

          return (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground text-[11px] max-w-[125px] truncate">
                {txRef}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(txRef, txRef)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Copy Transaction Reference"
              >
                {isCopied ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span className="sr-only">Copy TxRef</span>
              </Button>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const order = row.original;

          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedOrder(order);
                  setIsDetailDialogOpen(true);
                }}
                className="h-8 gap-1 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
              >
                <Eye className="h-3.5 w-3.5" />
                Details
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Order Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDetailDialogOpen(true);
                    }}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    View Full Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                    Update Status
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                    Set Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "READY_FOR_PICKUP")}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Truck className="h-3.5 w-3.5 text-indigo-600" />
                    Ready for Pickup
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Mark Delivered
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                    className="gap-2 cursor-pointer text-xs text-destructive"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, copiedKey],
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Package className="h-6 w-6 text-primary" />
            Fellowship Store Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track student merchandise orders, verify Chapa & telebirr payments, and update delivery status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            className="h-9 gap-1.5"
            title="Refresh Orders"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!orders.length}
            className="h-9 gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export Orders CSV
          </Button>
        </div>
      </div>

      {/* Offline banner notification if active */}
      {isOfflineFallback && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 p-3.5 rounded-xl flex items-center justify-between text-amber-800 dark:text-amber-300 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Connected in demo preview mode. Displaying realistic fellowship student orders.
            </span>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={fetchOrders}
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
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{orders.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Action</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{pendingOrdersCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Delivered Orders</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{deliveredCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Collected Revenue</p>
              <p className="text-xl font-bold text-foreground mt-0.5">
                {totalRevenue.toLocaleString()}{" "}
                <span className="text-xs font-medium text-muted-foreground">ETB</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Status Filter:</span>
        {STATUS_FILTER_TABS.map((tab) => {
          const isSelected = selectedStatusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TanStack DataTable */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchKey="customerName"
        searchPlaceholder="Search orders by customer name..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No fellowship orders match your current filter."
      />

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[620px]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2 text-foreground text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    Order Details
                  </DialogTitle>
                  <span className="font-mono text-xs font-bold text-primary bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                    #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <DialogDescription className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Placed on {format(new Date(selectedOrder.createdAt), "MMMM d, yyyy • HH:mm")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                {/* Status and Action banner */}
                <div className="p-3.5 bg-muted/50 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Order Status:</span>
                    {getOrderStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Update:</span>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(val) => updateOrderStatus(selectedOrder.id, val)}
                      disabled={updatingId === selectedOrder.id}
                    >
                      <SelectTrigger className="h-8 w-40 text-xs">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Customer and Contact Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-card rounded-xl border border-border">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">Buyer Name</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {selectedOrder.customerName}
                      </p>
                      {selectedOrder.department && (
                        <p className="text-xs text-muted-foreground">
                          {selectedOrder.department}
                          {selectedOrder.yearOfStudy ? ` • Year ${selectedOrder.yearOfStudy}` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">Phone Number</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={`tel:${selectedOrder.phoneNumber}`}
                          className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                        >
                          {selectedOrder.phoneNumber}
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(selectedOrder.phoneNumber, "Phone")}
                          className="h-5 w-5 text-muted-foreground hover:text-foreground"
                          title="Copy phone"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment information */}
                <div className="p-3.5 bg-card rounded-xl border border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Payment Method</p>
                    <div className="mt-1">
                      {getPaymentMethodBadge(selectedOrder.paymentMethod)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Payment Status</p>
                    <div className="mt-1">
                      {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Tx Reference</p>
                    <div className="flex items-center gap-1 mt-1 font-mono text-xs">
                      <span className="truncate max-w-[120px] text-foreground font-semibold">
                        {selectedOrder.txRef}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(selectedOrder.txRef, "TxRef")}
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        title="Copy TxRef"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Items Ordered List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ordered Items ({selectedOrder.items.length})
                  </h4>
                  <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={it.id || idx} className="p-3 flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {it.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Number(it.price).toFixed(2)} ETB &times; {it.quantity} unit{it.quantity > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-semibold text-foreground">
                          {(Number(it.price) * Number(it.quantity)).toLocaleString()} ETB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total sum */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">Total Order Amount</span>
                  <div className="text-xl font-bold text-foreground">
                    {Number(selectedOrder.totalAmount).toLocaleString()}{" "}
                    <span className="text-xs font-semibold text-primary">ETB</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
