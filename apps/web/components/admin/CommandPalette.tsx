"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  HeartHandshake,
  UserCheck,
  MapPin,
  Bell,
  Package,
  Briefcase,
  BarChart3,
  UserPlus,
  ShieldCheck,
  Settings,
  ShoppingBag,
  Users2,
  Users,
  PlusCircle,
  Database,
  ExternalLink,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search sections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/admin/devotions"))}
          >
            <PlusCircle className="mr-2 h-4 w-4 text-primary" />
            <span>New Devotional Entry</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/admin/events"))}
          >
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>Create Campus Event</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/admin/notifications"))}
          >
            <Bell className="mr-2 h-4 w-4 text-primary" />
            <span>Send Broadcast Notification</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/admin/store"))}
          >
            <ShoppingBag className="mr-2 h-4 w-4 text-primary" />
            <span>Add Store Merchandise</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Overview Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/users"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Users & Members</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/devotions"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Daily Devotionals</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/events"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Events & Gatherings</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/givings"))}>
            <HeartHandshake className="mr-2 h-4 w-4" />
            <span>Givings & Transactions</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/teams"))}>
            <Users2 className="mr-2 h-4 w-4" />
            <span>Ministry Teams</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/programs"))}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Programs & Schedules</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/locations"))}>
            <MapPin className="mr-2 h-4 w-4" />
            <span>Locations & Prayer Rooms</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/leaders"))}>
            <UserCheck className="mr-2 h-4 w-4" />
            <span>Fellowship Leaders</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/store"))}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Store Products</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/orders"))}>
            <Package className="mr-2 h-4 w-4" />
            <span>Orders & Pickup</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/requests"))}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Join Requests</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/reports"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Reports & Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/roles"))}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Roles & Permissions (RBAC)</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/admin/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>System Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="External & Companion">
          <CommandItem onSelect={() => handleSelect(() => router.push("/"))}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Public Fellowship Web App</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/community"))}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Student Community Feed</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/devotions"))}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Today's Daily Devotional</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
