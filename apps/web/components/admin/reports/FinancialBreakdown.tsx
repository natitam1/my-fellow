"use client";

import React from "react";
import { GivingTypeBreakdown, PaymentChannelBreakdown } from "./types";
import { DollarSign, Smartphone, Landmark, Wallet, PieChart, Layers } from "lucide-react";

interface FinancialBreakdownProps {
  givingTypes: GivingTypeBreakdown[];
  paymentChannels: PaymentChannelBreakdown[];
  totalGivings: number;
  loading: boolean;
}

export default function FinancialBreakdown({
  givingTypes,
  paymentChannels,
  totalGivings,
  loading,
}: FinancialBreakdownProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "Telebirr":
        return <Smartphone className="w-4 h-4 text-sky-600" />;
      case "CBE Birr":
        return <Landmark className="w-4 h-4 text-purple-600" />;
      default:
        return <Wallet className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribution by Giving Type */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Distribution by Giving Type
                </h3>
                <p className="text-xs text-gray-500">
                  Tithes, ministry offerings, retreats & capital works
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {givingTypes.length} Categories
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <div className="w-7 h-7 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading allocation...</p>
            </div>
          ) : (
            <div className="space-y-4 mt-5">
              {givingTypes.map((item) => (
                <div key={item.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-gray-800">
                        {item.type}
                      </span>
                      <span className="text-gray-400">
                        ({item.count} contributions)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {item.amount.toLocaleString()} ETB
                      </span>
                      <span className="text-gray-500 font-medium w-12 text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Total Recorded Givings:</span>
          <span className="font-bold text-gray-900 text-sm">
            {totalGivings.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Breakdown by Payment Channel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Breakdown by Payment Channel
                </h3>
                <p className="text-xs text-gray-500">
                  Ethio Telecom Telebirr, CBE Birr & Digital Gateways
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              National Gateways
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <div className="w-7 h-7 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading channel statistics...</p>
            </div>
          ) : (
            <div className="space-y-4 mt-5">
              {paymentChannels.map((channel) => (
                <div
                  key={channel.channel}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-2xs">
                        {getChannelIcon(channel.channel)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">
                          {channel.channel}
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          {channel.count} settled transactions
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">
                        {channel.amount.toLocaleString()} ETB
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {channel.percentage.toFixed(1)}% volume share
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200/70 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${channel.percentage}%`,
                        backgroundColor: channel.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Settlement Mode:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Instant Reconciliation
          </span>
        </div>
      </div>
    </div>
  );
}
