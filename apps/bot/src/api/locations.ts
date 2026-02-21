import { publicApi } from "./client";

export async function getAllLocations() {
  const { data } = await publicApi.get("/api/locations");
  return data;
}

export async function getLocationById(id: string) {
  const { data } = await publicApi.get(`/api/locations/${id}`);
  return data;
}
