import { publicApi } from "./client";

export async function getAllPrograms() {
  const { data } = await publicApi.get("/api/programs");
  return data;
}

export async function getProgramById(id: string) {
  const { data } = await publicApi.get(`/api/programs/${id}`);
  return data;
}
