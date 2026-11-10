import { publicApi, createApiClient } from "./client";
export interface DevotionQuery {
    page?: number;
    limit?: number;
    type?: "text" | "voice" | "pdf" | "book";
    search?: string;
    featured?: boolean;
}
export async function getAllDevotions(query?: DevotionQuery) {
    const { data } = await publicApi.get("/api/devotions", { params: query });
    return data;
}
export async function recordDevotionView(id: string) {
    const { data } = await publicApi.post(`/api/devotions/${id}/view`);
    return data;
}
export async function likeUnlikeDevotion(token: string, id: string) {
    const api = createApiClient(token);
    const { data } = await api.post(`/api/devotions/${id}/like`);
    return data;
}
