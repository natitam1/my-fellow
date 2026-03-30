import { createApiClient } from "./client";

export async function getAdminStats(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/admin/stats");
  return data;
}

export async function getAdminUsers(token: string, page: number = 1) {
  const api = createApiClient(token);
  const { data } = await api.get(`/api/admin/users?page=${page}&limit=10`);
  return data;
}

export async function getAdminEvents(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/admin/events");
  return data;
}

export async function getAdminRegistrations(token: string, page: number = 1) {
  const api = createApiClient(token);
  const { data } = await api.get(
    `/api/admin/registrations?page=${page}&limit=10`,
  );
  return data;
}

export async function getAdminTransactions(token: string, page: number = 1) {
  const api = createApiClient(token);
  const { data } = await api.get(
    `/api/admin/transactions?page=${page}&limit=10`,
  );
  return data;
}

export async function createEvent(token: string, body: Record<string, any>) {
  const api = createApiClient(token);
  if (body.imageBuffer) {
    const formData = new FormData();
    Object.keys(body).forEach((key) => {
      if (key === "imageBuffer") {
        const fileBlob = new Blob([body.imageBuffer], { type: "image/jpeg" });
        formData.append("image", fileBlob, "event.jpg");
      } else if (body[key] !== undefined) {
        formData.append(key, body[key]);
      }
    });
    const { data } = await api.post("/api/events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
  const { data } = await api.post("/api/events", body);
  return data;
}

export async function deleteEvent(token: string, id: string) {
  const api = createApiClient(token);
  const { data } = await api.delete(`/api/events/${id}`);
  return data;
}

export async function createDevotion(token: string, body: Record<string, any>) {
  const api = createApiClient(token);
  const { data } = await api.post("/api/devotions", body);
  return data;
}

export async function deleteDevotion(token: string, id: string) {
  const api = createApiClient(token);
  const { data } = await api.delete(`/api/devotions/${id}`);
  return data;
}

export async function getDevotions(token: string, page: number = 1) {
  const api = createApiClient(token);
  const { data } = await api.get(`/api/devotions?page=${page}&limit=10`);
  return data;
}

export async function createLeader(token: string, body: Record<string, any>) {
  const api = createApiClient(token);
  const { data } = await api.post("/api/leaders", body);
  return data;
}

export async function deleteLeader(token: string, id: string) {
  const api = createApiClient(token);
  const { data } = await api.delete(`/api/leaders/${id}`);
  return data;
}

export async function getLeaders(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/leaders");
  return data;
}

export async function createProgram(token: string, body: Record<string, any>) {
  const api = createApiClient(token);
  const { data } = await api.post("/api/programs", body);
  return data;
}

export async function deleteProgram(token: string, id: string) {
  const api = createApiClient(token);
  const { data } = await api.delete(`/api/programs/${id}`);
  return data;
}

export async function getPrograms(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/programs");
  return data;
}

export async function createTeam(token: string, body: Record<string, any>) {
  const api = createApiClient(token);
  const { data } = await api.post("/api/teams", body);
  return data;
}

export async function deleteTeam(token: string, id: string) {
  const api = createApiClient(token);
  const { data } = await api.delete(`/api/teams/${id}`);
  return data;
}

export async function getTeams(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/teams");
  return data;
}

export async function createLocation(token: string, body: Record<string, any>) {
  const api = createApiClient(token);
  const { data } = await api.post("/api/locations", body);
  return data;
}

export async function deleteLocation(token: string, id: string) {
  const api = createApiClient(token);
  const { data } = await api.delete(`/api/locations/${id}`);
  return data;
}

export async function getLocations(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/locations");
  return data;
}

export async function getOrders(token: string, page: number = 1) {
  const api = createApiClient(token);
  const { data } = await api.get(
    `/api/marketplace/orders?page=${page}&limit=10`,
  );
  return data;
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: string,
) {
  const api = createApiClient(token);
  const { data } = await api.patch(`/api/marketplace/orders/${id}/status`, {
    status,
  });
  return data;
}

export async function getJoinRequests(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/join-requests");
  return data;
}

export async function updateJoinRequestStatus(
  token: string,
  id: string,
  status: string,
) {
  const api = createApiClient(token);
  const { data } = await api.patch(`/api/join-requests/${id}/status`, {
    status,
  });
  return data;
}
