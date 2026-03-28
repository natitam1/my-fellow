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
  team?: string;
  department?: string;
  yearOfStudy?: string;
  telegramUserName?: string | null;
  profileImage?: any;
}) {
  const formData = new FormData();
  formData.append("fullName", body.fullName);
  formData.append("phoneNumber", body.phoneNumber);
  formData.append("password", "telegram-bot-user");
  formData.append("confirmPassword", "telegram-bot-user");

  if (body.team) formData.append("team", body.team);
  if (body.department) formData.append("department", body.department);
  if (body.yearOfStudy) formData.append("yearOfStudy", body.yearOfStudy);
  if (body.telegramUserName)
    formData.append("telegramUserName", body.telegramUserName);

  if (body.profileImage) {
    // profileImage is expected to be a Blob or Buffer with filename
    formData.append("file", body.profileImage, "profile.jpg");
  }

  const { data } = await publicApi.post("/api/auth/signup", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}
