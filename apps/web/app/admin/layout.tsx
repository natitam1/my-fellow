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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div
        className={cn(
          "min-h-screen flex flex-col flex-1 transition-all duration-300 ease-in-out w-full overflow-x-hidden",
          isCollapsed ? "md:pl-20" : "md:pl-64",
        )}
      >
        <DashboardHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <div
          role="region"
          aria-label="Admin Content"
          className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto"
        >
          {children}
        </div>
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
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setRedirecting(true);
      router.replace(`/signin?next=${encodeURIComponent(pathname || "/admin")}`);
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Verifying administrative session...
          </div>
        </div>
      </div>
    );
  }

  // Access denied fallback (shown briefly while redirecting to /signin)
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900/50">
            <ShieldAlert size={24} />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
            Administrative Access Required
          </h2>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {isAuthenticated
              ? `Your account (${user?.role || "member"}) does not have administrative privileges. Please sign in with an authorized administrator account.`
              : "Please sign in with your Fellowship administrator account to access the admin dashboard."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
            <Button
              asChild
              className="w-full sm:w-1/2 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <Link href={`/signin?next=${encodeURIComponent(pathname || "/admin")}`}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-1/2"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Web Companion
              </Link>
            </Button>
          </div>

          {redirecting && (
            <p className="text-xs text-muted-foreground mt-4 animate-pulse">
              Redirecting to sign-in...
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
