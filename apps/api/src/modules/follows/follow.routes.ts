import { Router, Response } from "express";
import mongoose from "mongoose";
import { requireAuth, AuthRequest } from "../../middleware/auth.middleware.js";
import { optionalAuth } from "../../platform/auth.js";
import { AppError } from "../../platform/errors.js";
import {
  serializeUserSummary,
  getAcademicLabel,
} from "../../platform/serializer.js";
import { buildPaginatedResponse, decodeCursor } from "../../platform/pagination.js";
import { routeParam } from "../../utils/routeParam.js";
import {
  ProfileModel,
  FollowModel,
  BlockModel,
  MediaAssetModel,
  ActorModel,
} from "../../models/social.models.js";
import { followTarget, unfollowTarget } from "./follow.service.js";

const router = Router();

// POST /api/v1/follows/:id (works for both Actors like @fellow and regular Users)
router.post("/follows/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const followerId = req.user!.sub;
    const result = await followTarget(followerId, routeParam(req.params.id));
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/follows/:id
router.delete("/follows/:id", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const followerId = req.user!.sub;
    const result = await unfollowTarget(followerId, routeParam(req.params.id));
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/users/:id/follow
router.put("/users/:id/follow", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const followerId = req.user!.sub;
    const result = await followTarget(followerId, routeParam(req.params.id));
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/users/:id/follow
router.post("/users/:id/follow", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const followerId = req.user!.sub;
    const result = await followTarget(followerId, routeParam(req.params.id));
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/users/:id/follow
router.delete("/users/:id/follow", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const followerId = req.user!.sub;
    const result = await unfollowTarget(followerId, routeParam(req.params.id));
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/profiles/:username/followers
router.get("/profiles/:username/followers", optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const rawUsername = routeParam(req.params.username);
    const cleanParam = rawUsername.replace(/^@/, "");
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const cursor = decodeCursor(req.query.cursor as string);
    const viewerId = req.user?.sub;

    let followeeId: string | null = null;
    const profile = await ProfileModel.findOne({
      $or: [
        { userId: cleanParam },
        { username: new RegExp(`^${cleanParam}$`, "i") },
      ],
    }).lean();

    if (profile) {
      followeeId = (profile as any).userId;
    } else {
      const isObjectId = mongoose.Types.ObjectId.isValid(cleanParam);
      const actor = await ActorModel.findOne({
        $or: [
          ...(isObjectId ? [{ _id: cleanParam }] : []),
          { handle: new RegExp(`^${cleanParam}$`, "i") },
        ],
        deletedAt: null,
      }).lean();

      if (actor) {
        followeeId = (actor as any)._id.toString();
      }
    }

    if (!followeeId) throw AppError.notFound("Profile not found");

    const query: any = {
      followeeId,
      status: "accepted",
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor.t) };
    }

    const follows = await FollowModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const followerIds = follows.map((f: any) => f.followerId);
    let viewerFollowingSet = new Set<string>();
    if (viewerId) {
      const viewerFollows = await FollowModel.find({
        followerId: viewerId,
        followeeId: { $in: followerIds },
        status: "accepted",
      }).select("followeeId").lean();
      viewerFollowingSet = new Set(viewerFollows.map((vf: any) => vf.followeeId));
    }

    const followerProfiles = await ProfileModel.find({ userId: { $in: followerIds } }).lean();
    const avatarIds = followerProfiles
      .map((p: any) => p.avatarAssetId)
      .filter((id): id is string => Boolean(id));
    const avatars = await MediaAssetModel.find({
      $or: [{ _id: { $in: avatarIds } }, { id: { $in: avatarIds } }],
    }).lean();
    const avatarMap = new Map(avatars.map((a: any) => [a._id ? a._id.toString() : a.id, a]));
    const profileMap = new Map(followerProfiles.map((p: any) => [p.userId, p]));

    const response = buildPaginatedResponse(follows, limit, (item: any) => ({
      t: new Date(item.createdAt).toISOString(),
      id: item.followerId,
    }));

    return res.json({
      ...response,
      items: response.items.map((item: any) => {
        const follower = profileMap.get(item.followerId);
        return {
          ...serializeUserSummary(
            follower,
            follower?.avatarAssetId ? avatarMap.get(follower.avatarAssetId) : null
          ),
          isFollowing: viewerFollowingSet.has(item.followerId),
          fellowshipRole: follower?.fellowshipRole,
          academicLabel: getAcademicLabel(follower?.department, follower?.studyYear),
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/profiles/:username/following
router.get("/profiles/:username/following", optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const rawUsername = routeParam(req.params.username);
    const cleanParam = rawUsername.replace(/^@/, "");
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const cursor = decodeCursor(req.query.cursor as string);
    const viewerId = req.user?.sub;

    let followerId: string | null = null;
    const profile = await ProfileModel.findOne({
      $or: [
        { userId: cleanParam },
        { username: new RegExp(`^${cleanParam}$`, "i") },
      ],
    }).lean();

    if (profile) {
      followerId = (profile as any).userId;
    } else {
      const isObjectId = mongoose.Types.ObjectId.isValid(cleanParam);
      const actor = await ActorModel.findOne({
        $or: [
          ...(isObjectId ? [{ _id: cleanParam }] : []),
          { handle: new RegExp(`^${cleanParam}$`, "i") },
        ],
        deletedAt: null,
      }).lean();

      if (actor) {
        followerId = (actor as any)._id.toString();
      }
    }

    if (!followerId) throw AppError.notFound("Profile not found");

    const query: any = {
      followerId,
      status: "accepted",
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor.t) };
    }

    const follows = await FollowModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const followeeIds = follows.map((f: any) => f.followeeId);
    let viewerFollowingSet = new Set<string>();
    if (viewerId) {
      const viewerFollows = await FollowModel.find({
        followerId: viewerId,
        followeeId: { $in: followeeIds },
        status: "accepted",
      }).select("followeeId").lean();
      viewerFollowingSet = new Set(viewerFollows.map((vf: any) => vf.followeeId));
    }

    const followeeProfiles = await ProfileModel.find({ userId: { $in: followeeIds } }).lean();
    const avatarIds = followeeProfiles
      .map((p: any) => p.avatarAssetId)
      .filter((id): id is string => Boolean(id));
    const avatars = await MediaAssetModel.find({
      $or: [{ _id: { $in: avatarIds } }, { id: { $in: avatarIds } }],
    }).lean();
    const avatarMap = new Map(avatars.map((a: any) => [a._id ? a._id.toString() : a.id, a]));
    const profileMap = new Map(followeeProfiles.map((p: any) => [p.userId, p]));

    const response = buildPaginatedResponse(follows, limit, (item: any) => ({
      t: new Date(item.createdAt).toISOString(),
      id: item.followeeId,
    }));

    return res.json({
      ...response,
      items: response.items.map((item: any) => {
        const followee = profileMap.get(item.followeeId);
        return {
          ...serializeUserSummary(
            followee,
            followee?.avatarAssetId ? avatarMap.get(followee.avatarAssetId) : null
          ),
          isFollowing: viewerFollowingSet.has(item.followeeId),
          fellowshipRole: followee?.fellowshipRole,
          academicLabel: getAcademicLabel(followee?.department, followee?.studyYear),
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/profiles/:username/mutuals
router.get("/profiles/:username/mutuals", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const viewerId = req.user!.sub;
    const rawUsername = routeParam(req.params.username);
    const cleanParam = rawUsername.replace(/^@/, "");

    let targetUserId: string | null = null;
    const profile = await ProfileModel.findOne({
      $or: [
        { userId: cleanParam },
        { username: new RegExp(`^${cleanParam}$`, "i") },
      ],
    }).lean();

    if (profile) {
      targetUserId = (profile as any).userId;
    } else {
      const isObjectId = mongoose.Types.ObjectId.isValid(cleanParam);
      const actor = await ActorModel.findOne({
        $or: [
          ...(isObjectId ? [{ _id: cleanParam }] : []),
          { handle: new RegExp(`^${cleanParam}$`, "i") },
        ],
        deletedAt: null,
      }).lean();

      if (actor) {
        targetUserId = (actor as any)._id.toString();
      }
    }

    if (!targetUserId) throw AppError.notFound("Profile not found");

    // People target follows
    const targetFollowees = await FollowModel.find({ followerId: targetUserId, status: "accepted" }).select("followeeId").lean();
    const targetFolloweeIds = targetFollowees.map((tf: any) => tf.followeeId);

    // People viewer also follows among target's followees
    const viewerMutualFollows = await FollowModel.find({
      followerId: viewerId,
      followeeId: { $in: targetFolloweeIds },
      status: "accepted",
    }).limit(20).lean();
    const mutualUserIds = viewerMutualFollows.map((mf: any) => mf.followeeId);

    const mutualProfiles = await ProfileModel.find({ userId: { $in: mutualUserIds } }).lean();
    const avatarIds = mutualProfiles
      .map((p: any) => p.avatarAssetId)
      .filter((id): id is string => Boolean(id));
    const avatars = await MediaAssetModel.find({
      $or: [{ _id: { $in: avatarIds } }, { id: { $in: avatarIds } }],
    }).lean();
    const avatarMap = new Map(avatars.map((a: any) => [a._id ? a._id.toString() : a.id, a]));

    const items = mutualProfiles.map((p: any) =>
      serializeUserSummary(
        p,
        p.avatarAssetId ? avatarMap.get(p.avatarAssetId) : null
      )
    );

    return res.json({
      items,
      total: items.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
