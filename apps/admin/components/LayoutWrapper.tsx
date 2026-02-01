"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { cn } from "@/lib/utils";

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();

  return (
    <>
      <Sidebar />
      <div
        className={cn(
          "min-h-screen flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "pl-20" : "pl-64",
        )}
      >
        <DashboardHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
};

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
