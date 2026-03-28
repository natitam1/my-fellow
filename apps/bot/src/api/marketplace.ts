import { publicApi, createApiClient } from "./client";
export async function getAllProducts() {
    const { data } = await publicApi.get("/api/marketplace/products");
    return data;
}
export async function getProductById(id: string) {
    const { data } = await publicApi.get(`/api/marketplace/products/${id}`);
    return data;
}
export async function createOrder(token: string, items: {
    productId: string;
    quantity: number;
}[]) {
    const api = createApiClient(token);
    const { data } = await api.post("/api/marketplace/orders", { items });
    return data;
}
export async function getMyOrders(token: string) {
    const api = createApiClient(token);
    const { data } = await api.get("/api/marketplace/orders/my");
    return data;
}
