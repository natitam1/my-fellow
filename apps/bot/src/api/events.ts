import { publicApi, createApiClient } from "./client";

// ── Public ──────────────────────────────────────────────

export async function getAllEvents() {
  const { data } = await publicApi.get("/api/events");
  return data;
}

export async function getEventById(id: string) {
  const { data } = await publicApi.get(`/api/events/${id}`);
  return data;
}

/**
 * Register for an event — public endpoint, no auth needed.
 */
export async function registerForEvent(body: {
  fullName: string;
  phoneNumber: string;
  team: string;
  department: string;
  yearOfStudy: string;
  telegramUserName: string;
  eventTitle: string;
}) {
  const { data } = await publicApi.post("/api/events/register", body);
  return data;
}

// ── Admin ───────────────────────────────────────────────

export async function getAllRegistrations(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/events/registrations");
  return data;
}

export async function getRegistrationsByEvent(
  token: string,
  eventTitle: string,
) {
  const api = createApiClient(token);
  const { data } = await api.get(`/api/events/registrations/${eventTitle}`);
  return data;
}
