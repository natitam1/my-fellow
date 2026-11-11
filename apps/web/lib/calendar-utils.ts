/**
 * Calendar and date utility functions for Fellowship Events & Programs
 */

export interface CalendarEventPayload {
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export function formatEventDateBadge(dateString: string) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      return { month: "TBD", day: "--", weekday: "TBD", time: "TBD" };
    }
    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const day = d.toLocaleDateString("en-US", { day: "2-digit" });
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { month, day, weekday, time };
  } catch {
    return { month: "TBD", day: "--", weekday: "TBD", time: "TBD" };
  }
}

export function formatEventDateTimeRange(startDateStr: string, endDateStr: string): string {
  try {
    const s = new Date(startDateStr);
    const e = new Date(endDateStr);

    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Date to be announced";

    const isSameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate();

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    if (isSameDay) {
      return `${s.toLocaleDateString("en-US", dateOptions)} • ${s.toLocaleTimeString(
        "en-US",
        timeOptions
      )} – ${e.toLocaleTimeString("en-US", timeOptions)}`;
    } else {
      return `${s.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${e.toLocaleDateString("en-US", dateOptions)}`;
    }
  } catch {
    return "Date to be announced";
  }
}

export function createGoogleCalendarUrl(payload: CalendarEventPayload): string {
  const formatUtc = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const startUtc = formatUtc(payload.startDate);
  const endUtc = formatUtc(payload.endDate);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: payload.title,
    dates: `${startUtc}/${endUtc}`,
    details: payload.description,
    location: payload.location,
    sf: "true",
    output: "xml",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(payload: CalendarEventPayload, filename = "fellowship-event.ics") {
  const formatUtc = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const startUtc = formatUtc(payload.startDate);
  const endUtc = formatUtc(payload.endDate);
  const cleanTitle = payload.title.replace(/\n/g, " ");
  const cleanLocation = payload.location.replace(/\n/g, " ");
  const cleanDesc = payload.description.replace(/\n/g, "\\n");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AAU 4-Kilo ECSF//My Fellow//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@4kilofellowship.org`,
    `DTSTAMP:${formatUtc(new Date().toISOString())}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLocation}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
