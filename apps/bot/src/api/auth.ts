import { publicApi } from "./client";

export async function lookupByPhone(phoneNumber: string) {
  const { data } = await publicApi.post("/api/auth/lookup-by-phone", {
    phoneNumber,
  });
  return data;
}

export async function signIn(body: any) {
  const { data } = await publicApi.post("/api/auth/signin", body);
  return data;
}

export async function registerUser(body: {
  fullName: string;
  phoneNumber: string;
}) {
  const { data } = await publicApi.post("/api/auth/signup", {
    ...body,
    password: "telegram-bot-user",
    confirmPassword: "telegram-bot-user",
  });
  return data;
}
