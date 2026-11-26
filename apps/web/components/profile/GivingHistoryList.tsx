"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GivingTransaction } from "@/lib/directory-data";
import { getToken } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface RawPaymentItem {
  _id?: string;
  id?: string;
  tx_ref?: string;
  txRef?: string;
  amount?: number;
  currency?: string;
  reason?: string;
  type?: string;
  status?: "completed" | "pending" | "failed";
  createdAt?: string;
  paymentMethod?: string;
  gateway?: string;
  receiptNumber?: string;
}

export function GivingHistoryList() {
  const [givings, setGivings] = useState<GivingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<string | null>(null);

  const fetchGivings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setGivings([]);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/payments/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch giving records (${res.status})`);
      }

      const json: { data?: RawPaymentItem[] } = await res.json();
      const rawItems = Array.isArray(json.data) ? json.data : [];

      const formatted: GivingTransaction[] = rawItems.map((item, idx) => ({
        id: item._id || item.id || `giv-${idx}`,
        txRef: item.tx_ref || item.txRef || `fellow-tx-${idx}`,
        amount: typeof item.amount === "number" ? item.amount : 0,
        currency: item.currency || "ETB",
        reason: item.reason || item.type || "Fellowship Offering",
        status: item.status || "completed",
        createdAt: item.createdAt || new Date().toISOString(),
        paymentMethod: item.paymentMethod || item.gateway || "Telebirr / Chapa",
        receiptNumber: item.receiptNumber || item.tx_ref || item.txRef || `RCP-4K-${10000 + idx}`,
      }));

      setGivings(formatted);
    } catch (err) {
      console.error("Failed to load giving history:", err);
      setGivings([]);
      setError("Unable to load your giving history right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGivings();
  }, [fetchGivings]);

  const totalGiven = givings
    .filter((g) => g.status === "completed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const completedCount = givings.filter((g) => g.status === "completed").length;

  const handleCopyReceipt = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedReceipt(ref);
    toast.success("Receipt ID copied!");
    setTimeout(() => setCopiedReceipt(null), 2500);
  };

  const formatDateString = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="border-border/80 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Lifetime Given</p>
              <h4 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {totalGiven.toLocaleString()}{" "}
                <span className="text-xs font-semibold text-primary">ETB</span>
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                God loves a cheerful giver
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Coins className="h-5 w-5" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Successful Gifts</p>
              <h4 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {completedCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">Offerings</span>
              </h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                {completedCount > 0 ? "Reconciled" : "No receipts yet"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Latest Seed Sown</p>
              <h4 className="text-base sm:text-lg font-bold text-foreground mt-1 truncate max-w-[140px]">
                {givings[0] ? formatDateString(givings[0].createdAt) : "None yet"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[160px]">
                {givings[0]
                  ? `${givings[0].amount.toLocaleString()} ${givings[0].currency} (${givings[0].reason})`
                  : "Support fellowship ministry"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Heart className="h-5 w-5" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State Banner */}
      {error && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchGivings}
            className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/15 self-start sm:self-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      {/* Transactions Header & Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h4 className="text-sm font-bold text-foreground">Transaction Records</h4>
          <p className="text-xs text-muted-foreground">
            Synced with your verified fellowship giving account
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs h-8 shadow-xs"
        >
          <Link href="/givings">
            <Heart className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Give New Offering
          </Link>
        </Button>
      </div>

      {/* Table Container */}
      <Card className="overflow-hidden border-border/80 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold">Purpose / Reason</TableHead>
                <TableHead className="text-xs font-semibold">Method</TableHead>
                <TableHead className="text-xs font-semibold">Receipt / Ref</TableHead>
                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                      Loading giving history...
                    </span>
                  </TableCell>
                </TableRow>
              ) : givings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                    {error
                      ? "Could not display giving records due to a connection issue."
                      : "No giving transactions recorded yet."}
                  </TableCell>
                </TableRow>
              ) : (
                givings.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateString(tx.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {tx.reason}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-3 w-3 text-primary" aria-hidden="true" />
                        {tx.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">{tx.receiptNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyReceipt(tx.receiptNumber)}
                          className="text-muted-foreground hover:text-foreground p-0.5"
                          title="Copy receipt number"
                          aria-label={`Copy receipt number ${tx.receiptNumber}`}
                        >
                          {copiedReceipt === tx.receiptNumber ? (
                            <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3 w-3" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground text-right whitespace-nowrap">
                      {tx.amount.toLocaleString()} {tx.currency}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold px-2 py-0.5 ${
                          tx.status === "completed"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : tx.status === "failed"
                              ? "border-destructive/30 bg-destructive/10 text-destructive"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {tx.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
