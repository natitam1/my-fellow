import { createApiClient } from "./client";
export async function initializePayment(
  token: string,
  body: {
    amount: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    reason: string;
  },
) {
  const api = createApiClient(token);
  const { data } = await api.post("/api/payments/chapa/init", body);
  return data;
}
export async function verifyPayment(token: string, txRef: string) {
  const api = createApiClient(token);
  const { data } = await api.get(`/api/payments/chapa/verify/${txRef}`);
  return data;
}
