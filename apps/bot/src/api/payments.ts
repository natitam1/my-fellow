import { createApiClient } from "./client";
export async function initializePayment(
  token: string,
  body: {
    amount: number;
    fullName?: string;
    phone?: string;
    phoneNumber?: string;
    email: string;
    reason: string;
  },
) {
  const api = createApiClient(token);
  const { data } = await api.post("/api/payments/jami/init", {
    amount: body.amount,
    email: body.email,
    phone: body.phone || body.phoneNumber,
    reason: body.reason,
  });
  return data;
}
export async function verifyPayment(token: string, sessionIdOrRef: string) {
  const api = createApiClient(token);
  const { data } = await api.get(`/api/payments/jami/verify/${sessionIdOrRef}`);
  return data;
}
export async function getMyGivings(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get("/api/payments/my-givings");
  return data;
}
