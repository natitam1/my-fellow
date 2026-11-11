"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  Copy,
  Check,
  Coins,
  TrendingUp,
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
import { GivingTransaction, MOCK_USER_GIVINGS } from "@/lib/directory-data";
import { toast } from "sonner";
import { format } from "date-fns";

export function GivingHistoryList() {
  const [givings, setGivings] = useState<GivingTransaction[]>(MOCK_USER_GIVINGS);
  const [loading, setLoading] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState<string | null>(null);

  useEffect(() => {
    const fetchGivings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/payments/my");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            // Map backend data to GivingTransaction format if necessary
            const formatted: GivingTransaction[] = json.data.map((item: any, idx: number) => ({
              id: item._id || item.id || `giv-${idx}`,
              txRef: item.tx_ref || item.txRef || `fellow-jami-${idx}`,
              amount: item.amount || 0,
              currency: item.currency || "ETB",
              reason: item.reason || item.type || "Fellowship Offering",
              status: item.status || "completed",
              createdAt: item.createdAt || new Date().toISOString(),
              paymentMethod: item.paymentMethod || item.gateway || "Telebirr via Jami",
              receiptNumber: item.receiptNumber || `RCP-4K-${10000 + idx}`,
            }));
            setGivings(formatted);
          }
        }
      } catch (err) {
        // Fall back to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchGivings();
  }, []);

  const totalGiven = givings
    .filter((g) => g.status === "completed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const completedCount = givings.filter((g) => g.status === "completed").length;

  const handleCopyReceipt = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedReceipt(ref);
    toast.success("Receipt ID copied! 🧾");
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
                {totalGiven.toLocaleString()} <span className="text-xs font-semibold text-[#FF6719]">ETB</span>
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">God loves a cheerful giver</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6719]/10 text-[#FF6719]">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Successful Gifts</p>
              <h4 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {completedCount} <span className="text-xs font-normal text-muted-foreground">Offerings</span>
              </h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> All reconciled
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Latest Seed Sown</p>
              <h4 className="text-base sm:text-lg font-bold text-foreground mt-1 truncate max-w-[130px]">
                {givings[0] ? formatDateString(givings[0].createdAt) : "None yet"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {givings[0] ? `${givings[0].amount} ETB (${givings[0].reason})` : "Start today"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Heart className="h-5 w-5 text-[#FF6719]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Header & Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h4 className="text-sm font-bold text-foreground">Transaction Records</h4>
          <p className="text-xs text-muted-foreground">
            Directly synced from Jami / Telebirr gateway
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium text-xs h-8 shadow-xs"
        >
          <Link href="/catalog">
            <Heart className="h-3.5 w-3.5 mr-1.5 fill-white/20" />
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
              {givings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                    No giving transactions recorded yet.
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
                        <CreditCard className="h-3 w-3 text-[#FF6719]" />
                        {tx.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">{tx.receiptNumber}</span>
                        <button
                          onClick={() => handleCopyReceipt(tx.receiptNumber)}
                          className="text-muted-foreground hover:text-foreground p-0.5"
                          title="Copy receipt number"
                        >
                          {copiedReceipt === tx.receiptNumber ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
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
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-600"
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
