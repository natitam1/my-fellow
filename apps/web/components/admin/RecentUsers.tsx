"use client";

import React, { useState, useEffect } from "react";
import { Loader2, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MOCK_USERS, MockUser } from "@/lib/mock-data";

interface AdminUser {
  _id: string;
  fullName?: string;
  name?: string;
  phoneNumber?: string;
  department?: string;
  team?: string;
  ministryTeam?: string;
  profileImage?: string | null;
  avatarUrl?: string;
  year?: string;
}

export function RecentUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        const raw = response.data;
        const usersData = Array.isArray(raw) ? raw : raw?.data || [];
        if (Array.isArray(usersData) && usersData.length > 0) {
          setUsers(usersData.slice(-5).reverse());
        } else {
          // Fallback to realistic mock users
          setUsers(
            MOCK_USERS.slice(0, 5).map((u: MockUser) => ({
              _id: u._id,
              fullName: u.name,
              phoneNumber: u.phoneNumber,
              department: u.department,
              team: u.ministryTeam,
              year: u.year,
            })),
          );
        }
      } catch (error) {
        console.warn("Could not fetch recent users, using fellowship fallback");
        setUsers(
          MOCK_USERS.slice(0, 5).map((u: MockUser) => ({
            _id: u._id,
            fullName: u.name,
            phoneNumber: u.phoneNumber,
            department: u.department,
            team: u.ministryTeam,
            year: u.year,
          })),
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center border-border/80 bg-card shadow-xs h-full min-h-[300px]">
        <Loader2 className="animate-spin text-primary h-6 w-6" />
        <p className="mt-2 text-xs text-muted-foreground">Loading members...</p>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card shadow-xs flex flex-col h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Recent Members
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Newly registered campus fellowship students
          </CardDescription>
        </div>
        <Badge variant="secondary" className="text-[11px] font-normal">
          {users.length} latest
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 p-0 px-6 pb-6">
        <div className="divide-y divide-border/40">
          {users.map((user, index) => {
            const displayName = user.fullName || user.name || "Fellowship Member";
            const initial = displayName.charAt(0).toUpperCase();
            const ministryTeam = user.team || user.ministryTeam || "General Member";

            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-3 group hover:bg-muted/30 px-2 rounded-lg -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 border border-border/60">
                    <AvatarImage
                      src={user.profileImage || user.avatarUrl}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.phoneNumber || "No phone provided"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <p className="text-[11px] font-medium text-foreground">
                    {user.department || "AAU 4 Kilo"}
                  </p>
                  <p className="text-[10px] text-primary font-medium">
                    {ministryTeam}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {users.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground">No recent members found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
