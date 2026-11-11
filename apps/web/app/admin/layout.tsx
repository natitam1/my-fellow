"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SidebarProvider, useSidebar } from "@/context/admin/SidebarContext";
import { Sidebar } from "@/components/admin/Sidebar";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldAlert, Loader2, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";

function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen flex flex-col flex-1 transition-all duration-300 ease-in-out w-full overflow-x-hidden",
          isCollapsed ? "pl-20" : "pl-64",
        )}
      >
        <DashboardHeader />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        setRedirecting(true);
        const timeout = setTimeout(() => {
          router.replace(`/signin?redirect=${encodeURIComponent(pathname || "/admin")}`);
        }, 1200);
        return () => clearTimeout(timeout);
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6719] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF6719]" />
            Verifying administrative session...
          </div>
        </div>
      </div>
    );
  }

  // Access denied fallback (shown while redirecting or if redirect blocked)
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/50">
            <ShieldAlert size={24} />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
            Admin Access Required
          </h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
            {isAuthenticated
              ? `Your account (${user?.role || "member"}) does not have administrative privileges. Please log in with an administrator, super admin, or leader account.`
              : "You must be signed in with administrative credentials to access the Fellowship administration dashboard."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Button
              asChild
              className="w-full sm:w-auto bg-[#FF6719] hover:bg-[#e05813] text-white"
            >
              <Link href={`/signin?redirect=${encodeURIComponent(pathname || "/admin")}`}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Admin
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Web App
              </Link>
            </Button>
          </div>

          {redirecting && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4 animate-pulse">
              Redirecting you to sign in...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </SidebarProvider>
  );
}
