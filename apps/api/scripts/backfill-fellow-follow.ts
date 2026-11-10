import "dotenv/config";
import mongoose from "mongoose";
import { UserModel } from "../src/models/user.model.js";
import { ActorModel, FollowModel } from "../src/models/social.models.js";
import { ensureDefaultActors, OFFICIAL_ACTOR } from "../src/modules/actors/actor.service.js";

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI environment variable is required.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB for fellowship auto-follow backfill...");
  await mongoose.connect(mongoUri);

  try {
    console.log("1. Ensuring default actors exist and official actor handle is 'fellow'...");
    await ensureDefaultActors();

    const officialActor = await ActorModel.findOne({
      $or: [{ handle: OFFICIAL_ACTOR.handle }, { type: "official" }],
      deletedAt: null,
    });

    if (!officialActor) {
      console.error("Official actor 'fellow' could not be found or initialized.");
      process.exit(1);
    }

    const officialActorId = officialActor._id.toString();
    console.log(`Official actor resolved: id=${officialActorId}, handle=${officialActor.handle}`);

    console.log("2. Fetching all users from UserModel...");
    const users = await UserModel.find({}, "_id fullName phoneNumber").lean();
    console.log(`Found ${users.length} users in the database.`);

    let newlyFollowedCount = 0;
    let alreadyFollowingCount = 0;

    for (const u of users) {
      const followerId = u._id.toString();
      if (followerId === officialActorId) continue;

      const existingFollow = await FollowModel.findOne({
        followerId,
        followeeId: officialActorId,
      });

      if (!existingFollow) {
        try {
          await FollowModel.create({
            followerId,
            followeeId: officialActorId,
            status: "accepted",
          });
          newlyFollowedCount++;
        } catch (err: any) {
          if (err?.code === 11000) {
            alreadyFollowingCount++;
          } else {
            console.error(`Error following for user ${followerId}:`, err);
          }
        }
      } else {
        alreadyFollowingCount++;
      }
    }

    console.log(`New follows created: ${newlyFollowedCount}`);
    console.log(`Already following: ${alreadyFollowingCount}`);

    console.log("3. Recalculating exact followersCount for official actor...");
    const actualFollowersCount = await FollowModel.countDocuments({
      followeeId: officialActorId,
      status: "accepted",
    });

    await ActorModel.updateOne(
      { _id: officialActor._id },
      { $set: { followersCount: actualFollowersCount } }
    );

    console.log("--------------------------------------------------");
    console.log("SUCCESS: Backfill completed successfully!");
    console.log(`Official Actor Handle: ${officialActor.handle}`);
    console.log(`Total Users Processed: ${users.length}`);
    console.log(`Total Followers Count: ${actualFollowersCount}`);
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("Error during backfill:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
