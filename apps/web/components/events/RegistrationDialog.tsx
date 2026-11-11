"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  FellowshipEvent,
  RegistrationTicket,
  MINISTRY_TEAMS,
} from "@/lib/events-data";
import {
  formatEventDateTimeRange,
  createGoogleCalendarUrl,
  downloadIcsFile,
} from "@/lib/calendar-utils";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Ticket,
  Copy,
  Check,
  CalendarPlus,
  Download,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface RegistrationDialogProps {
  event: FellowshipEvent;
  triggerButton?: React.ReactNode;
  onRegisteredSuccess?: (ticket: RegistrationTicket) => void;
}

export function RegistrationDialog({
  event,
  triggerButton,
  onRegisteredSuccess,
}: RegistrationDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ticket, setTicket] = useState<RegistrationTicket | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    teamOrDepartment: "",
    notes: "",
  });

  // Pre-fill if authenticated user
  useEffect(() => {
    if (user && open) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        phoneNumber: prev.phoneNumber || user.phoneNumber || "",
        teamOrDepartment:
          prev.teamOrDepartment || user.team || user.department || "All Fellowship",
      }));
    }
  }, [user, open]);

  const seatsLeft = Math.max(
    0,
    (event.registrationLimit || 0) - event.registrationsCount
  );
  const isFull = event.registrationLimit > 0 && seatsLeft === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMsg("Please enter your active phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          team: formData.teamOrDepartment || "General Fellowship",
          department: formData.teamOrDepartment,
          notes: formData.notes.trim(),
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Registration failed");
      }

      const confirmedTicket = resData.data as RegistrationTicket;
      setTicket(confirmedTicket);
      toast.success("Registration confirmed! See you at the fellowship gathering.");
      if (onRegisteredSuccess) {
        onRegisteredSuccess(confirmedTicket);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const copyTicketCode = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.ticketNumber);
    setCopied(true);
    toast.success("Ticket code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIcs = () => {
    downloadIcsFile(
      {
        title: event.title,
        description: `${event.shortDescription}\n\nTicket Code: ${ticket?.ticketNumber}`,
        location: `${event.location.name}${
          event.location.room ? `, ${event.location.room}` : ""
        }`,
        startDate: event.startDate,
        endDate: event.endDate,
      },
      `${event.slug || "fellowship-event"}-pass.ics`
    );
  };

  const resetFormAndClose = () => {
    setOpen(false);
    // Give time for modal close animation before resetting
    setTimeout(() => {
      setTicket(null);
      setErrorMsg(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            disabled={isFull || !event.isRegistrationOpen}
            className="w-full sm:w-auto font-medium"
          >
            {isFull
              ? "Registration Full"
              : !event.isRegistrationOpen
              ? "Registration Closed"
              : event.buttonText || "Register for Event"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:p-6">
        {!ticket ? (
          /* REGISTRATION FORM VIEW */
          <>
            <DialogHeader className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-primary border-primary/30">
                  {event.categoryLabel}
                </Badge>
                {seatsLeft <= 25 && seatsLeft > 0 && (
                  <Badge variant="destructive" className="text-[11px]">
                    Only {seatsLeft} spots left!
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Register for {event.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex flex-col gap-1 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  {formatEventDateTimeRange(event.startDate, event.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  {event.location.name} {event.location.room && `(${event.location.room})`}
                </span>
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Dawit Bekele"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs font-semibold">
                  Phone Number (Ethiopian format) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="e.g. 0911223344 or +251 9..."
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="h-10 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used for SMS check-in confirmation and fellowship reminders.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="teamOrDepartment" className="text-xs font-semibold">
                  Ministry Team / Academic Department
                </Label>
                <div className="relative">
                  <Input
                    id="teamOrDepartment"
                    list="ministry-teams-list"
                    placeholder="e.g. Worship & Arts, Computer Science 3rd Year, or General"
                    value={formData.teamOrDepartment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teamOrDepartment: e.target.value,
                      })
                    }
                    disabled={loading}
                    className="h-10 text-sm"
                  />
                  <datalist id="ministry-teams-list">
                    {MINISTRY_TEAMS.map((team) => (
                      <option key={team} value={team} />
                    ))}
                    <option value="Computer Science" />
                    <option value="Information Technology" />
                    <option value="Physics & Mathematics" />
                    <option value="Biology & Chemistry" />
                    <option value="Freshman 1st Year" />
                  </datalist>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Questions or Prayer Requests (Optional)
                </Label>
                <Input
                  id="notes"
                  placeholder="Any dietary needs, transportation query or prayer request"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  disabled={loading}
                  className="h-10 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Seats left: <strong>{seatsLeft}</strong>
                </span>
                <span>
                  Admission: <strong>{event.admissionFee}</strong>
                </span>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || isFull}
                  className="gap-2 font-medium"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Confirming Registration..." : "Confirm My Registration"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          /* REGISTRATION SUCCESS / TICKET CONFIRMATION BADGE */
          <div className="py-2 space-y-5">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                You&apos;re Registered!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground max-w-sm">
                Your place is confirmed for the fellowship gathering. Show this pass or your ticket code at the entrance desk.
              </DialogDescription>
            </div>

            {/* DIGITAL FELLOWSHIP TICKET BADGE */}
            <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-b from-card to-muted/40 p-5 shadow-xs relative overflow-hidden space-y-4">
              {/* Fellowship Orange Accent Banner */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      ECSF 4-KILO DIGITAL PASS
                    </span>
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                      {ticket.eventTitle}
                    </h4>
                  </div>
                </div>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-mono text-[10px] uppercase">
                  Confirmed
                </Badge>
              </div>

              {/* Attendee details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    Attendee Name
                  </span>
                  <p className="font-semibold text-foreground truncate">{ticket.fullName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    Phone Number
                  </span>
                  <p className="font-mono text-foreground">{ticket.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    Ministry / Dept
                  </span>
                  <p className="text-foreground truncate">{ticket.teamOrDepartment}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    Date & Time
                  </span>
                  <p className="text-foreground truncate">
                    {new Date(ticket.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Venue */}
              <div className="text-xs pt-2 border-t border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                  Venue & Room
                </span>
                <p className="font-medium text-foreground">
                  {ticket.locationName} {ticket.room ? `• ${ticket.room}` : ""}
                </p>
              </div>

              {/* Ticket Code Box */}
              <div className="p-3 bg-background rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium">
                    Ticket Reference Code
                  </span>
                  <p className="font-mono text-lg font-bold text-primary tracking-widest">
                    {ticket.ticketNumber}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyTicketCode}
                  className="gap-1.5 h-8 text-xs font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={createGoogleCalendarUrl({
                  title: event.title,
                  description: `${event.shortDescription}\n\nTicket: ${ticket.ticketNumber}`,
                  location: event.location.name,
                  startDate: event.startDate,
                  endDate: event.endDate,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-lg bg-card hover:bg-accent transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-primary" />
                Google Calendar
              </a>

              <button
                type="button"
                onClick={handleDownloadIcs}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-lg bg-card hover:bg-accent transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                Download .ICS Pass
              </button>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                className="w-full font-medium"
                onClick={resetFormAndClose}
              >
                Done & Return to Events
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
