import mongoose from "mongoose";
import { AppError } from "../../platform/errors.js";
import {
  ProfileModel,
  FollowModel,
  BlockModel,
  ActorModel,
  OutboxEventModel,
} from "../../models/social.models.js";
import { UserModel } from "../../models/user.model.js";

export interface FollowResult {
  success: boolean;
  following: boolean;
  isFollowing: boolean;
  status: "accepted" | "pending" | "unfollowed";
  followersCount: number;
  followerCount: number;
  isActor: boolean;
  actor?: any;
}

/**
 * Follow a target entity, which may be an Actor (e.g. @fellow or team)
 * or a regular User (by userId or username).
 */
export async function followTarget(
  followerId: string,
  targetParam: string
): Promise<FollowResult> {
  const cleanParam = targetParam.trim().replace(/^@/, "");
  const isObjectId = mongoose.Types.ObjectId.isValid(cleanParam);

  // 1. Check if the target is an Actor (by handle or ObjectId)
  const actor = await ActorModel.findOne({
    $or: [
      ...(isObjectId ? [{ _id: cleanParam }] : []),
      { handle: new RegExp(`^${cleanParam}$`, "i") },
    ],
    deletedAt: null,
  });

  if (actor) {
    const followeeId = actor._id.toString();

    // Prevent actor self-follow if follower is associated
    if (followerId === followeeId || (actor.userId && actor.userId === followerId)) {
      throw AppError.badRequest("You cannot follow yourself", "CANNOT_FOLLOW_SELF");
    }

    // Check block
    const block = await BlockModel.findOne({
      $or: [
        { blockerId: followerId, blockedId: followeeId },
        { blockerId: followeeId, blockedId: followerId },
      ],
    }).lean();
    if (block) {
      throw AppError.forbidden("Cannot follow a blocked account", "USER_BLOCKED");
    }

    const existing = await FollowModel.findOne({ followerId, followeeId });
    if (existing) {
      const count = actor.followersCount ?? actor.followerCount ?? 0;
      return {
        success: true,
        following: existing.status === "accepted",
        isFollowing: existing.status === "accepted",
        status: existing.status,
        followersCount: count,
        followerCount: count,
        isActor: true,
        actor,
      };
    }

    await FollowModel.create({
      followerId,
      followeeId,
      status: "accepted",
    });

    await ProfileModel.updateOne(
      { userId: followerId },
      { $inc: { followingCount: 1 } }
    );

    const updatedActor = await ActorModel.findByIdAndUpdate(
      actor._id,
      { $inc: { followersCount: 1, followerCount: 1 } },
      { new: true }
    );

    const currentCount =
      updatedActor?.followersCount ??
      updatedActor?.followerCount ??
      (actor.followersCount || 0) + 1;

    await OutboxEventModel.create({
      type: "follow.created",
      aggregateId: followeeId,
      payload: {
        actorId: followerId,
        recipientId: followeeId,
        isActor: true,
      },
    });

    return {
      success: true,
      following: true,
      isFollowing: true,
      status: "accepted",
      followersCount: currentCount,
      followerCount: currentCount,
      isActor: true,
      actor: updatedActor,
    };
  }

  // 2. Target is a regular user (by userId or username)
  let targetProfile = await ProfileModel.findOne({
    $or: [
      { userId: cleanParam },
      { username: new RegExp(`^${cleanParam}$`, "i") },
    ],
  });

  if (!targetProfile && isObjectId) {
    const user = await UserModel.findById(cleanParam).lean();
    if (user) {
      const uId = String(user._id);
      targetProfile = await ProfileModel.findOne({ userId: uId });
      if (!targetProfile) {
        targetProfile = await ProfileModel.create({
          userId: uId,
          username: user.telegramUserName?.replace(/^@/, "") || `user_${uId.slice(-6)}`,
          displayName: user.fullName || "Fellowship Member",
          followersCount: 0,
          followingCount: 0,
          visibility: "public",
        });
      }
    }
  }

  if (!targetProfile) {
    throw AppError.notFound("User or actor not found", "USER_NOT_FOUND");
  }

  const followeeId = targetProfile.userId;
  if (followerId === followeeId) {
    throw AppError.badRequest("You cannot follow yourself", "CANNOT_FOLLOW_SELF");
  }

  const block = await BlockModel.findOne({
    $or: [
      { blockerId: followerId, blockedId: followeeId },
      { blockerId: followeeId, blockedId: followerId },
    ],
  }).lean();
  if (block) {
    throw AppError.forbidden("Cannot follow a blocked user", "USER_BLOCKED");
  }

  const initialStatus = targetProfile.visibility === "followers" ? "pending" : "accepted";

  const existing = await FollowModel.findOne({ followerId, followeeId });
  if (existing) {
    const count = targetProfile.followersCount ?? 0;
    return {
      success: true,
      following: existing.status === "accepted",
      isFollowing: existing.status === "accepted",
      status: existing.status,
      followersCount: count,
      followerCount: count,
      isActor: false,
    };
  }

  await FollowModel.create({
    followerId,
    followeeId,
    status: initialStatus,
  });

  if (initialStatus === "accepted") {
    await ProfileModel.updateOne(
      { userId: followerId },
      { $inc: { followingCount: 1 } }
    );
    targetProfile.followersCount = (targetProfile.followersCount || 0) + 1;
    await targetProfile.save();

    await OutboxEventModel.create({
      type: "follow.created",
      aggregateId: followeeId,
      payload: {
        actorId: followerId,
        recipientId: followeeId,
        isActor: false,
      },
    });

    return {
      success: true,
      following: true,
      isFollowing: true,
      status: initialStatus,
      followersCount: targetProfile.followersCount,
      followerCount: targetProfile.followersCount,
      isActor: false,
    };
  }

  return {
    success: true,
    following: false,
    isFollowing: false,
    status: initialStatus,
    followersCount: targetProfile.followersCount || 0,
    followerCount: targetProfile.followersCount || 0,
    isActor: false,
  };
}

/**
 * Unfollow a target entity (Actor or User).
 */
export async function unfollowTarget(
  followerId: string,
  targetParam: string
): Promise<FollowResult> {
  const cleanParam = targetParam.trim().replace(/^@/, "");
  const isObjectId = mongoose.Types.ObjectId.isValid(cleanParam);

  // 1. Check if target is an Actor
  const actor = await ActorModel.findOne({
    $or: [
      ...(isObjectId ? [{ _id: cleanParam }] : []),
      { handle: new RegExp(`^${cleanParam}$`, "i") },
    ],
    deletedAt: null,
  });

  if (actor) {
    const followeeId = actor._id.toString();
    const existing = await FollowModel.findOneAndDelete({ followerId, followeeId });

    if (!existing) {
      const current = await ActorModel.findById(followeeId).lean();
      const count = current?.followersCount ?? current?.followerCount ?? 0;
      return {
        success: true,
        following: false,
        isFollowing: false,
        status: "unfollowed",
        followersCount: count,
        followerCount: count,
        isActor: true,
        actor: current,
      };
    }

    if (existing.status === "accepted") {
      await ProfileModel.updateOne(
        { userId: followerId },
        { $inc: { followingCount: -1 } }
      );
      const updated = await ActorModel.findByIdAndUpdate(
        actor._id,
        { $inc: { followersCount: -1, followerCount: -1 } },
        { new: true }
      );

      const finalCount = Math.max(0, updated?.followersCount ?? updated?.followerCount ?? 0);
      return {
        success: true,
        following: false,
        isFollowing: false,
        status: "unfollowed",
        followersCount: finalCount,
        followerCount: finalCount,
        isActor: true,
        actor: updated,
      };
    }

    const current = await ActorModel.findById(followeeId).lean();
    const count = current?.followersCount ?? current?.followerCount ?? 0;
    return {
      success: true,
      following: false,
      isFollowing: false,
      status: "unfollowed",
      followersCount: count,
      followerCount: count,
      isActor: true,
      actor: current,
    };
  }

  // 2. Target is a regular user
  const targetLookup = await ProfileModel.findOne({
    $or: [
      { userId: cleanParam },
      { username: new RegExp(`^${cleanParam}$`, "i") },
    ],
  }).lean();
  const followeeId = (targetLookup as any)?.userId || cleanParam;

  const existing = await FollowModel.findOneAndDelete({ followerId, followeeId });
  if (!existing) {
    const target = await ProfileModel.findOne({ userId: followeeId }).lean();
    const count = (target as any)?.followersCount || 0;
    return {
      success: true,
      following: false,
      isFollowing: false,
      status: "unfollowed",
      followersCount: count,
      followerCount: count,
      isActor: false,
    };
  }

  if (existing.status === "accepted") {
    await ProfileModel.updateOne(
      { userId: followerId },
      { $inc: { followingCount: -1 } }
    );

    const updated = await ProfileModel.findOneAndUpdate(
      { userId: followeeId },
      { $inc: { followersCount: -1 } },
      { new: true }
    ).lean();

    const finalCount = Math.max(0, (updated as any)?.followersCount || 0);
    return {
      success: true,
      following: false,
      isFollowing: false,
      status: "unfollowed",
      followersCount: finalCount,
      followerCount: finalCount,
      isActor: false,
    };
  }

  const currentTarget = await ProfileModel.findOne({ userId: followeeId }).lean();
  const count = (currentTarget as any)?.followersCount || 0;
  return {
    success: true,
    following: false,
    isFollowing: false,
    status: "unfollowed",
    followersCount: count,
    followerCount: count,
    isActor: false,
  };
}
