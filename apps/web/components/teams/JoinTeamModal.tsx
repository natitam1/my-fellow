"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { MinistryTeam } from "@/lib/directory-data";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Send, Users, ShieldCheck } from "lucide-react";

interface JoinTeamModalProps {
  team: MinistryTeam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (teamId: string) => void;
}

const YEAR_OPTIONS = [
  "Year 1 (Freshman)",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5 (Graduating)",
  "Postgraduate",
];

export function JoinTeamModal({
  team,
  open,
  onOpenChange,
  onSuccess,
}: JoinTeamModalProps) {
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setIsSubmitted(false);
      if (user) {
        setFullName(user.fullName || "");
        setPhoneNumber(user.phoneNumber || "");
        setDepartment(user.department || "");
        setYear(user.yearOfStudy || "Year 3");
        setTelegramHandle(
          user.telegramUserName ? user.telegramUserName.replace(/^@/, "") : ""
        );
      } else {
        setFullName("");
        setPhoneNumber("");
        setDepartment("");
        setYear("Year 2");
        setTelegramHandle("");
      }
      setMessage("");
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error("Please provide your full name and phone number.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        teamId: team.id,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        department: department.trim() || "AAU Campus",
        year: year || "Year 2",
        telegramHandle: telegramHandle.trim()
          ? `@${telegramHandle.trim().replace(/^@/, "")}`
          : "@fellow_member",
        message: message.trim(),
      };

      const res = await fetch("/api/join-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.message || "Failed to submit request");
      }

      setIsSubmitted(true);
      toast.success(`Application sent to ${team.name}! 🎉`);
      if (onSuccess) {
        onSuccess(team.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit join request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {isSubmitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">
                Join Request Submitted!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you for offering your gifts to serve the fellowship in the <strong>{team.name}</strong>. The ministry coordinator will contact you via Telegram or phone before the next orientation.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ministry Coordinator:</span>
                <span className="font-semibold text-foreground">{team.leader.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next Rehearsal/Meeting:</span>
                <span className="font-semibold text-foreground">{team.meetingDay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Meeting Time:</span>
                <span className="font-semibold text-foreground">{team.meetingTime}</span>
              </div>
            </div>

            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="border-[#FF6719]/40 bg-[#FF6719]/10 text-[#FF6719] text-[10px] font-semibold"
                >
                  Join Ministry Team
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold">{team.name}</DialogTitle>
              <DialogDescription>
                Fill out this quick form to request membership in this fellowship ministry.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="join-name" className="text-xs font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="join-name"
                    placeholder="e.g. Dawit Haile"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="join-phone" className="text-xs font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="join-phone"
                    placeholder="0911223344"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Department & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="join-dept" className="text-xs font-medium">
                    Department
                  </Label>
                  <Input
                    id="join-dept"
                    placeholder="e.g. Mechanical Eng"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="join-year" className="text-xs font-medium">
                    Year of Study
                  </Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger id="join-year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Telegram Username */}
              <div className="space-y-1.5">
                <Label htmlFor="join-telegram" className="text-xs font-medium">
                  Telegram Username (for team group addition)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="join-telegram"
                    placeholder="username"
                    className="pl-7"
                    value={telegramHandle}
                    onChange={(e) => setTelegramHandle(e.target.value)}
                  />
                </div>
              </div>

              {/* Statement of Interest / Skills */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="join-msg" className="text-xs font-medium">
                    Why do you want to join this ministry?
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Optional</span>
                </div>
                <Textarea
                  id="join-msg"
                  rows={3}
                  maxLength={400}
                  placeholder="Share any past experience, musical instruments played, design skills, or your spiritual motivation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#FF6719] shrink-0" />
                <span>
                  Applications are reviewed by {team.leader.name} within 2-3 days.
                </span>
              </div>

              <DialogFooter className="pt-2 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Join Request
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
