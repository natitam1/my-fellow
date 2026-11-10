import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";

import { mongoClient } from "./utils/mongodb.js";
import { sweepExpiredEvents } from "./utils/cron.js";
import {
  ensureDefaultActors,
  syncAllUsersFollowOfficialActor,
} from "./modules/actors/actor.service.js";

const PORT: number = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

Promise.all([
  mongoose.connect(MONGO_URI, {
    maxPoolSize: 50,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  }),
  mongoClient.connect(),
])
  .then(async () => {
    console.log("MongoDB (Mongoose & MongoClient) connected successfully");

    // Perform initial sweep of expired events immediately on server start
    await sweepExpiredEvents().catch((e) =>
      console.error("Initial sweep failed:", e),
    );

    // Ensure canonical actors (8 teams + official fellowship identity)
    await ensureDefaultActors().catch((e: unknown) =>
      console.error("Actor initialization failed:", e),
    );

    // Safe idempotent background sync ensuring all existing users follow the fellow actor
    syncAllUsersFollowOfficialActor().catch((e: unknown) =>
      console.error("Background auto-follow sync failed:", e),
    );

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    let isShuttingDown = false;
    const gracefulShutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("[Server] HTTP server listener closed.");
        try {
          await Promise.allSettled([
            mongoose.disconnect(),
            mongoClient.close(),
          ]);
          console.log("[Server] Database connections cleanly closed.");
          process.exit(0);
        } catch (err) {
          console.error("[Server] Error closing database connections:", err);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error("[Server] Forceful shutdown after 10s timeout.");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((err: unknown) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });
