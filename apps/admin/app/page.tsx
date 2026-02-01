import { SummaryCards } from "@/components/SummaryCards";
import { OverviewChart } from "@/components/OverviewChart";
import { RecentUsers } from "@/components/RecentUsers";
import { ArrowUpRight, Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back! Here's what's happening with your community.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff6719] text-white text-sm font-medium hover:bg-[#e65c16] transition-colors shadow-lg shadow-orange-500/20">
            <Plus size={18} />
            Add New Event
          </button>
        </div>
      </div>

      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>

        <div className="flex flex-col gap-8">
          <div className="p-6 rounded-2xl bg-[#ff6719] text-white shadow-lg shadow-orange-500/30 flex flex-col justify-between h-full min-h-[180px]">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                Monthly Goal
              </p>
              <h3 className="text-2xl font-bold mt-1">$20,000.00</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs mt-4">
                <span>Progress</span>
                <span>65%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[65%] rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Next Event</h3>
              <ArrowUpRight size={18} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-[#ff6719]">22</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Evange Vs. BS</p>
                  <p className="text-xs text-gray-500">
                    Football Match • 7:00 PM
                  </p>
                </div>
              </div>
              <button className="w-full py-2 rounded-lg bg-gray-50 dark:bg-zinc-900 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <RecentUsers />
      </div>
    </div>
  );
}
