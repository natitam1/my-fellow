import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer, phoneNumber } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { OtpRecordModel } from "./models/otp.model.js";
import { OtpService, toLocalPhone } from "./services/otp.service.js";
import { mongoDb } from "./utils/mongodb.js";

const isProd = process.env.NODE_ENV === "production";

const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.JWT_SECRET ||
  (isProd ? undefined : "dev-only-secret-key-for-local-development");

if (isProd && !authSecret) {
  throw new Error(
    "BETTER_AUTH_SECRET or JWT_SECRET must be configured in production.",
  );
}

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const trustedOrigins = Array.from(
  new Set([
    "my-fellow://",
    "my-fellow://*",
    "exp://",
    "exp://*",
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:19006",
    "https://my-fellow-api.onrender.com",
    "https://*.primeuat.app",
    "https://fellow.primeuat.app",
    ...(process.env.API_URL ? [process.env.API_URL.trim()] : []),
    ...envAllowedOrigins,
  ]),
);

export async function revokeUserSessions(userId: string): Promise<void> {
  try {
    const idStr = String(userId);
    const filters: Array<Record<string, unknown>> = [{ userId: idStr }];
    if (mongoose.isValidObjectId(idStr)) {
      filters.push({ userId: new mongoose.Types.ObjectId(idStr) });
    }
    await mongoDb.collection("sessions").deleteMany({ $or: filters });
  } catch (err) {
    console.warn("[Auth] Failed to revoke Better-Auth sessions:", err);
  }
}

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb),
  secret: authSecret,
  baseURL:
    process.env.API_URL ||
    (isProd
      ? "https://my-fellow-api.onrender.com"
      : "http://localhost:3000"),
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "users",
    fields: {
      name: "fullName",
    },
    additionalFields: {
      fullName: {
        type: "string",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      team: {
        type: "string",
        required: false,
      },
      department: {
        type: "string",
        required: false,
      },
      yearOfStudy: {
        type: "string",
        required: false,
      },
      telegramUserName: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
        input: false,
      },
      profileImage: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  trustedOrigins,
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/send-verification-code": { window: 60, max: 5 },
      "/verify-phone-number": { window: 60, max: 10 },
      "/sign-in/phone-number": { window: 60, max: 10 },
    },
  },
  plugins: [
    expo(),
    bearer(),
    phoneNumber({
      sendOTP: async ({ phoneNumber: phone, code }, request) => {
        const localPhone = toLocalPhone(phone);
        const codeHash = OtpService.hashSecret(code);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Persist code hash with rate limits
        await OtpRecordModel.create({
          phoneNumber: localPhone,
          codeHash,
          purpose: "signup",
          expiresAt,
        });

        await OtpService.sendOtpSms(localPhone, code, "signup");
      },
      signUpOnVerification: {
        getTempEmail: (phone) => `${toLocalPhone(phone)}@myfellow.local`,
        getTempName: (phone) => `User ${toLocalPhone(phone)}`,
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
    }),
  ],
});
