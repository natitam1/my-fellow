import { publicApi, createApiClient } from "./client";
export async function getAllEvents() {
    const { data } = await publicApi.get("/api/events");
    return data;
}
export async function getEventById(id: string) {
    const { data } = await publicApi.get(`/api/events/${id}`);
    return data;
}
export async function registerForEvent(token: string, body: {
    eventId: string;
}) {
    const api = createApiClient(token);
    const { data } = await api.post("/api/events/register", body);
    return data;
}
export async function getAllRegistrations(token: string) {
    const api = createApiClient(token);
    const { data } = await api.get("/api/events/registrations");
    return data;
}
export async function getRegistrationsByEvent(token: string, eventTitle: string) {
    const api = createApiClient(token);
    const { data } = await api.get(`/api/events/registrations/${eventTitle}`);
    return data;
}
