import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import devotionRoutes from "./routes/devotion.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import joinRequestRoutes from "./routes/joinRequest.routes.js";
import leaderRoutes from "./routes/leader.routes.js";
import locationRoutes from "./routes/location.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import programRoutes from "./routes/program.routes.js";
import supportRoutes from "./routes/support.routes.js";
import teamRoutes from "./routes/team.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import v1Router from "./routes/v1.routes.js";
import rbacRoutes from "./routes/rbac.routes.js";
import { errorMiddleware } from "./platform/errors.js";
import job from "./utils/cron.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors());

// Static Assets Serving with Cache and CORS headers
const staticAssetOptions = {
  maxAge: "1d",
  setHeaders: (res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=86400");
  },
};

// Explicit CORS & CORP headers for all /assets requests
app.use("/assets", (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    return res.sendStatus(204);
  }
  next();
});

// Primary static assets from public/assets
app.use("/assets", express.static(path.join(process.cwd(), "public/assets"), staticAssetOptions));
app.use("/assets", express.static(path.join(__dirname, "../public/assets"), staticAssetOptions));
const cwdPublicAssets = path.resolve(process.cwd(), "my-fellow-api/public/assets");
if (fs.existsSync(cwdPublicAssets)) {
  app.use("/assets", express.static(cwdPublicAssets, staticAssetOptions));
}

// Fallback static assets from mobile app (mobile/assets/images or my-fellow/assets/images)
app.use("/assets", express.static(path.resolve(__dirname, "../../mobile/assets/images"), staticAssetOptions));
app.use("/assets", express.static(path.resolve(process.cwd(), "../mobile/assets/images"), staticAssetOptions));
app.use("/assets", express.static(path.resolve(process.cwd(), "apps/mobile/assets/images"), staticAssetOptions));
app.use("/assets", express.static(path.resolve(__dirname, "../../my-fellow/assets/images"), staticAssetOptions));
app.use("/assets", express.static(path.resolve(process.cwd(), "../my-fellow/assets/images"), staticAssetOptions));
const rootMobileAssets = path.resolve(process.cwd(), "my-fellow/assets/images");
if (fs.existsSync(rootMobileAssets)) {
  app.use("/assets", express.static(rootMobileAssets, staticAssetOptions));
}

const customAuthPaths = [
  "/api/auth/phone",
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/lookup-by-phone",
  "/api/auth/me",
  "/api/auth/profile",
  "/api/auth/update-phone",
  "/api/auth/change-password",
  "/api/auth/request-otp",
  "/api/auth/verify-otp",
  "/api/auth/reset-password",
];

// Mount Better Auth handler BEFORE body parsers for non-custom auth requests
app.all(["/api/auth", "/api/auth/*splat"], (req: Request, res: Response, next: NextFunction) => {
  if (customAuthPaths.some((p) => req.path.startsWith(p) || req.path === p)) {
    return next();
  }
  return toNodeHandler(auth)(req, res);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return next();
  }
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  })(req, res, next);
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const eventsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const teamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const programLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const locationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const leaderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const devotionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const marketplaceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter, authRoutes);


app.use("/api/upload", uploadLimiter, uploadRoutes);
app.use("/api/events", eventsLimiter, eventsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rbac", rbacRoutes);
app.use("/api/teams", teamLimiter, teamRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/programs", programLimiter, programRoutes);
app.use("/api/locations", locationLimiter, locationRoutes);
app.use("/api/leaders", leaderLimiter, leaderRoutes);
app.use("/api/devotions", devotionLimiter, devotionRoutes);
app.use("/api/marketplace", marketplaceLimiter, marketplaceRoutes);
app.use("/api/support", supportRoutes);

// 4K Social Platform v1 API
app.use("/api/v1", v1Router);

app.get("/health", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady && process.env.NODE_ENV === "production") {
    return res.status(503).json({ ok: false, error: "Database disconnected" });
  }
  return res.json({ ok: true, db: dbReady ? "connected" : "connecting" });
});

// RFC 9457 Centralized Error Middleware
app.use(errorMiddleware);

if (process.env.API_URL && process.env.NODE_ENV !== "test") {
  job.start();
}

export default app;
