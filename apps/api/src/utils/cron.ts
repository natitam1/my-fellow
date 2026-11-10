import { CronJob } from "cron";
import https from "https";
import EventModel from "../models/event.model.js";

export async function sweepExpiredEvents(): Promise<number> {
  try {
    const now = new Date();
    const result = await EventModel.updateMany(
      {
        isDeleted: { $ne: true },
        isPublished: { $ne: false },
        endDate: { $lt: now },
      },
      {
        $set: {
          isPublished: false,
          autoUnpublished: true,
        },
      },
    );
    if (result.modifiedCount > 0) {
      console.log(
        `[AutoUnpublish] Successfully unpublished ${result.modifiedCount} outdated/expired events.`,
      );
    }
    return result.modifiedCount;
  } catch (err) {
    console.error("[AutoUnpublish] Error sweeping expired events:", err);
    return 0;
  }
}

const job = new CronJob("*/9 * * * *", async () => {
  if (process.env.API_URL) {
    try {
      const res = await fetch(`${process.env.API_URL}/health`);
      await res.text(); // Drain stream to prevent connection/socket leak
      if (res.ok) {
        console.log("[KeepAlive] Health ping sent successfully");
      } else {
        console.warn(`[KeepAlive] Health ping returned status ${res.status}`);
      }
    } catch (e) {
      console.error("[KeepAlive] Error sending health ping:", e);
    }
  }

  // Automatically sweep and unpublish any events whose endDate has passed
  await sweepExpiredEvents();
});

export default job;
