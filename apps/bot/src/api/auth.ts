import { publicApi } from "./client";

export async function lookupByPhone(phoneNumber: string) {
  const { data } = await publicApi.post("/api/auth/lookup-by-phone", { phoneNumber });
  return data;
}

export async function registerUser(body: {
  fullName: string;
  phoneNumber: string;
}) {
  const { data } = await publicApi.post("/api/auth/signup", {
    ...body,
    password: "telegram-bot-user", // Default pass for bot-onboarded users
    confirmPassword: "telegram-bot-user"
  });
  return data;
}
