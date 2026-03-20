import { publicApi, createApiClient } from "./client";
export async function getAllTeams() {
  const { data } = await publicApi.get("/api/teams");
  return data;
}
export async function getTeamById(id: string) {
  const { data } = await publicApi.get(`/api/teams/${id}`);
  return data;
}
export async function createJoinRequest(
  token: string,
  body: {
    teamId: string;
    fullName: string;
    phoneNumber: string;
    department: string;
    year: string;
    telegramHandle: string;
    message: string;
  },
) {
  const api = createApiClient(token);
  const { data } = await api.post("/api/join-requests", body);
  return data;
}
export async function getMyJoinRequests(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/join-requests/my");
  return data;
}
