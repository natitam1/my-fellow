import { publicApi } from "./client";
export async function getAllLeaders() {
    const { data } = await publicApi.get("/api/leaders");
    return data;
}
export async function getLeaderById(id: string) {
    const { data } = await publicApi.get(`/api/leaders/${id}`);
    return data;
}
