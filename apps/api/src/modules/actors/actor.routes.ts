import { Router, Response } from "express";
import mongoose from "mongoose";
import { requireAuth, AuthRequest } from "../../middleware/auth.middleware.js";
import { optionalAuth } from "../../platform/auth.js";
import { AppError } from "../../platform/errors.js";
import { routeParam } from "../../utils/routeParam.js";
import { ActorModel, PostModel, FollowModel } from "../../models/social.models.js";
import { buildPaginatedResponse, decodeCursor } from "../../platform/pagination.js";
import { hydratePosts } from "../posts/post.service.js";
import {
  getPostableActors,
  ensureDefaultActors,
  CANONICAL_TEAMS,
  OFFICIAL_ACTOR,
} from "./actor.service.js";

const router = Router();

async function findActorByIdOrHandle(idOrHandle: string) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrHandle);
  const isOfficialAlias =
    idOrHandle.toLowerCase() === "fellow" ||
    idOrHandle.toLowerCase() === "official" ||
    idOrHandle.toLowerCase() === "4kilo_ecsf";

  let actor = await ActorModel.findOne({
    $or: [
      ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(idOrHandle) }] : []),
      { handle: idOrHandle.toLowerCase() },
      { handle: idOrHandle },
      { teamId: idOrHandle },
      { displayName: idOrHandle },
      ...(isOfficialAlias
        ? [
            { type: "official" as const },
            { handle: OFFICIAL_ACTOR.handle },
            { handle: "fellow" },
            { handle: "4kilo_ecsf" },
          ]
        : []),
    ] as any,
    deletedAt: null,
  }).lean();

  if (!actor) {
    await ensureDefaultActors();
    actor = await ActorModel.findOne({
      $or: [
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(idOrHandle) }] : []),
        { handle: idOrHandle.toLowerCase() },
        { handle: idOrHandle },
        { teamId: idOrHandle },
        { displayName: idOrHandle },
        ...(isOfficialAlias
          ? [
              { type: "official" as const },
              { handle: OFFICIAL_ACTOR.handle },
              { handle: "fellow" },
              { handle: "4kilo_ecsf" },
            ]
          : []),
      ] as any,
      deletedAt: null,
    }).lean();
  }

  if (!actor) {
    const canonical = CANONICAL_TEAMS.find(
      (t) =>
        t.handle.toLowerCase() === idOrHandle.toLowerCase() ||
        t.displayName.toLowerCase() === idOrHandle.toLowerCase() ||
        t.teamId.toLowerCase() === idOrHandle.toLowerCase() ||
        t.displayName.toLowerCase().replace(/ team$/i, "") === idOrHandle.toLowerCase()
    );
    if (canonical) {
      actor = (await ActorModel.findOne({ handle: canonical.handle, deletedAt: null }).lean()) || null;
    }
  }

  return actor;
}

// GET /api/v1/me/postable-actors
router.get("/me/postable-actors", requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = {
      sub: req.user!.sub,
      role: req.user!.role,
    };
    const actors = await getPostableActors(user);
    return res.json({ actors });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/actors
router.get("/actors", optionalAuth, async (_req: AuthRequest, res: Response, next) => {
  try {
    await ensureDefaultActors();
    const actors = await ActorModel.find({
      type: { $in: ["official", "team"] },
      deletedAt: null,
    }).lean();

    const canonicalHandles = CANONICAL_TEAMS.map((ct) => ct.handle.toLowerCase());
    actors.sort((a: any, b: any) => {
      if (a.type === "official" && b.type !== "official") return -1;
      if (b.type === "official" && a.type !== "official") return 1;
      const idxA = canonicalHandles.indexOf(String(a.handle || "").toLowerCase());
      const idxB = canonicalHandles.indexOf(String(b.handle || "").toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.displayName || "").localeCompare(b.displayName || "");
    });

    const actorIds = actors.map((a: any) => a._id.toString());
    const actorHandles = actors.map((a: any) => a.handle).filter(Boolean);

    const postCounts = await PostModel.aggregate([
      {
        $match: {
          authorActorId: { $in: [...actorIds, ...actorHandles] },
          deletedAt: null,
          kind: { $in: ["post", "repost", "quote"] },
        },
      },
      {
        $group: {
          _id: "$authorActorId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    for (const p of postCounts) {
      countMap.set(String(p._id), p.count);
    }

    const viewerId = _req.user?.sub;
    let followedActorIds = new Set<string>();
    if (viewerId) {
      const viewerFollows = await FollowModel.find({
        followerId: viewerId,
        followeeId: { $in: actorIds },
        status: "accepted",
      }).select("followeeId").lean();
      followedActorIds = new Set(viewerFollows.map((f: any) => f.followeeId));
    }

    return res.json({
      actors: actors.map((a: any) => {
        const idStr = a._id.toString();
        const postCount = (countMap.get(idStr) || 0) + (a.handle ? (countMap.get(a.handle) || 0) : 0);
        const followers = a.followersCount || 0;
        const isFollowing = followedActorIds.has(idStr);
        return {
          id: idStr,
          type: a.type,
          displayName: a.displayName,
          handle: a.handle,
          avatarUrl: a.avatarUrl,
          bio: a.bio,
          isVerified: Boolean(a.isVerified),
          teamId: a.teamId || null,
          followersCount: followers,
          followerCount: followers,
          postsCount: postCount,
          postCount,
          isFollowing,
          following: isFollowing,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/actors/:idOrHandle/posts
router.get(
  ["/actors/:idOrHandle/posts", "/actors/:id/posts"],
  optionalAuth,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const idOrHandle = routeParam(req.params.idOrHandle || (req.params as any).id);
      const actor = await findActorByIdOrHandle(idOrHandle);

      if (!actor) {
        throw AppError.notFound("Actor not found", "ACTOR_NOT_FOUND");
      }

      const viewerId = req.user?.sub;
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
      const cursor = decodeCursor(req.query.cursor as string);
      const actorIdStr = (actor as any)._id.toString();

      const query: any = {
        $or: [
          { authorActorId: actorIdStr },
          { authorActorId: (actor as any).handle },
          ...((actor as any).type === "official"
            ? [{ authorActorId: "fellow" }, { authorActorId: "official" }]
            : []),
          ...((actor as any).teamId ? [{ authorActorId: (actor as any).teamId }] : []),
        ],
        kind: { $in: ["post", "repost", "quote"] },
        deletedAt: null,
      };

      if (cursor) {
        query.createdAt = { $lt: new Date(cursor.t) };
      }

      const page = Number(req.query.page);
      let postsQuery = PostModel.find(query).sort({ createdAt: -1 });
      if (page && page > 0 && !cursor) {
        postsQuery = postsQuery.skip((page - 1) * limit).limit(limit + 1);
      } else {
        postsQuery = postsQuery.limit(limit + 1);
      }

      const posts = await postsQuery.lean();

      const paginated = buildPaginatedResponse(posts, limit, (item: any) => ({
        t: new Date(item.createdAt).toISOString(),
        id: item._id.toString(),
      }));

      const hydrated = await hydratePosts(paginated.items, viewerId);

      return res.json({
        items: hydrated,
        nextCursor: paginated.nextCursor,
        hasMore: paginated.hasMore,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/actors/:idOrHandle
router.get(
  ["/actors/:idOrHandle", "/actors/:id"],
  optionalAuth,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const idOrHandle = routeParam(req.params.idOrHandle || (req.params as any).id);
      const actor = await findActorByIdOrHandle(idOrHandle);

      if (!actor) {
        throw AppError.notFound("Actor not found", "ACTOR_NOT_FOUND");
      }

      const actorIdStr = (actor as any)._id.toString();

      const postCount = await PostModel.countDocuments({
        $or: [
          { authorActorId: actorIdStr },
          { authorActorId: (actor as any).handle },
          ...((actor as any).type === "official"
            ? [{ authorActorId: "fellow" }, { authorActorId: "official" }]
            : []),
          ...((actor as any).teamId ? [{ authorActorId: (actor as any).teamId }] : []),
        ],
        kind: { $in: ["post", "repost", "quote"] },
        deletedAt: null,
      });

      const followersCount = (actor as any).followersCount || 0;

      const viewerId = req.user?.sub;
      let isFollowing = false;
      if (viewerId) {
        const follow = await FollowModel.findOne({
          followerId: viewerId,
          followeeId: actorIdStr,
          status: "accepted",
        }).lean();
        isFollowing = Boolean(follow);
      }

      return res.json({
        id: actorIdStr,
        type: (actor as any).type,
        displayName: (actor as any).displayName,
        handle: (actor as any).handle,
        avatarUrl: (actor as any).avatarUrl,
        bio: (actor as any).bio,
        isVerified: Boolean((actor as any).isVerified),
        teamId: (actor as any).teamId || null,
        followersCount,
        followerCount: followersCount,
        postsCount: postCount,
        postCount,
        isFollowing,
        following: isFollowing,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
