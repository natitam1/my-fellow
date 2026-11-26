import { API_BASE_URL } from "./api";

export interface LiveDevotion {
  id: string;
  title: string;
  scripture: string;
  verseText: string;
  authorName: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  speaker?: string;
}

export interface LiveProgram {
  id: string;
  title: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface LiveTeam {
  id: string;
  name: string;
  description: string;
  memberCount?: number;
  meetingTime?: string;
  meetingLocation?: string;
}

export interface LiveCommunityPost {
  id: string;
  authorName: string;
  authorRole?: string;
  body: string;
  likesCount: number;
  repliesCount: number;
  createdAt?: string;
}

function unwrapArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const nested =
      obj.data ?? obj.items ?? obj.events ?? obj.programs ?? obj.teams ?? obj.devotions;
    if (Array.isArray(nested)) return nested as Record<string, unknown>[];
    if (nested && typeof nested === "object") {
      const inner = nested as Record<string, unknown>;
      const list =
        inner.items ?? inner.devotions ?? inner.events ?? inner.programs ?? inner.teams;
      if (Array.isArray(list)) return list as Record<string, unknown>[];
    }
  }
  return [];
}

function formatEventDate(raw?: unknown): string {
  if (!raw) return "Upcoming";
  const str = String(raw);
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime()) && str.includes("-")) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  return str;
}

export async function fetchLiveLandingData(): Promise<{
  devotion: LiveDevotion | null;
  events: LiveEvent[];
  programs: LiveProgram[];
  teams: LiveTeam[];
  featuredPost: LiveCommunityPost | null;
}> {
  const [devotionRes, eventsRes, programsRes, teamsRes, feedRes] =
    await Promise.allSettled([
      fetch(`${API_BASE_URL}/devotions?limit=1`, { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch("/api/events", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch("/api/programs", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch("/api/teams", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`${API_BASE_URL}/v1/feed/foryou?limit=1`, { cache: "no-store" }).then(
        (r) => (r.ok ? r.json() : null),
      ),
    ]);

  let devotion: LiveDevotion | null = null;
  if (devotionRes.status === "fulfilled" && devotionRes.value) {
    const list = unwrapArray(devotionRes.value);
    const first = list[0];
    if (first) {
      const authorObj = first.author as Record<string, unknown> | undefined;
      devotion = {
        id: String(first._id || first.id || ""),
        title: String(first.title || "Daily Devotion"),
        scripture: String(
          first.scripture || first.bibleReference || first.reference || "",
        ),
        verseText: String(
          first.verseText || first.content || first.body || first.summary || "",
        ),
        authorName: String(
          authorObj?.fullName || authorObj?.name || first.authorName || "Fellowship Writer",
        ),
      };
    }
  }

  const events: LiveEvent[] =
    eventsRes.status === "fulfilled" && eventsRes.value
      ? unwrapArray(eventsRes.value)
          .slice(0, 6)
          .map((e) => ({
            id: String(e._id || e.id || ""),
            title: String(e.title || e.name || "Fellowship Gathering"),
            description: String(e.description || ""),
            date: formatEventDate(e.date || e.eventDate || e.startDate),
            time: String(e.time || e.startTime || ""),
            location: String(e.location || e.venue || "4 Kilo Campus"),
            speaker: e.speaker ? String(e.speaker) : undefined,
          }))
      : [];

  const programs: LiveProgram[] =
    programsRes.status === "fulfilled" && programsRes.value
      ? unwrapArray(programsRes.value)
          .slice(0, 6)
          .map((p) => ({
            id: String(p._id || p.id || ""),
            title: String(p.title || p.name || "Weekly Program"),
            dayOfWeek: String(p.dayOfWeek || p.day || "Weekly"),
            startTime: String(p.startTime || p.time || ""),
            endTime: String(p.endTime || ""),
            location: String(p.location || p.venue || "4 Kilo Campus"),
          }))
      : [];

  const teams: LiveTeam[] =
    teamsRes.status === "fulfilled" && teamsRes.value
      ? unwrapArray(teamsRes.value)
          .slice(0, 6)
          .map((t) => ({
            id: String(t._id || t.id || ""),
            name: String(t.name || t.title || "Ministry Team"),
            description: String(t.description || ""),
            memberCount:
              typeof t.memberCount === "number"
                ? t.memberCount
                : Array.isArray(t.members)
                  ? t.members.length
                  : undefined,
            meetingTime: t.meetingTime ? String(t.meetingTime) : undefined,
            meetingLocation: t.meetingLocation
              ? String(t.meetingLocation)
              : undefined,
          }))
      : [];

  let featuredPost: LiveCommunityPost | null = null;
  if (feedRes.status === "fulfilled" && feedRes.value) {
    const posts = unwrapArray(feedRes.value);
    const first = posts[0];
    if (first && (first.body || first.content)) {
      const author = first.author as Record<string, unknown> | undefined;
      const counts = first.counts as Record<string, unknown> | undefined;
      featuredPost = {
        id: String(first.id || first._id || ""),
        authorName: String(
          author?.displayName ||
            author?.fullName ||
            author?.name ||
            "Fellowship Member",
        ),
        authorRole: author?.team ? String(author.team) : "4 Kilo Fellowship",
        body: String(first.body || first.content || ""),
        likesCount: Number(counts?.likes ?? first.likesCount ?? 0),
        repliesCount: Number(counts?.replies ?? first.repliesCount ?? 0),
        createdAt: first.createdAt ? String(first.createdAt) : undefined,
      };
    }
  }

  return { devotion, events, programs, teams, featuredPost };
}
