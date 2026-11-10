import { Request, Response } from "express";
import mongoose from "mongoose";
import DevotionModel from "../models/devotion.model.js";
import { UserModel } from "../models/user.model.js";
import {
  ActorModel,
  ProfileModel,
  TeamMemberModel,
} from "../models/social.models.js";
import { TeamModel } from "../models/team.model.js";
import { TeamMembershipModel } from "../models/rbac.model.js";
import { canPostAs, OFFICIAL_ACTOR } from "../modules/actors/actor.service.js";
import { normalizeRole } from "../rbac/permissions.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  createDevotionSchema,
  updateDevotionSchema,
} from "../validators/devotion.validator.js";
import {
  uploadDevotionImage,
  uploadDevotionMedia,
  deleteDevotionAssets,
  queryDevotions,
  incrementViews,
  toggleLike,
  formatCount,
  DevotionQueryOptions,
} from "../services/devotion.service.js";
import { routeParam } from "../utils/routeParam.js";

export interface ResolvedDevotionAuthor {
  author: string;
  authorHandle: string;
  authorActorId?: string;
  actorType: "official" | "team" | "user";
  authorAvatar?: string;
  authorRole: string;
  authorUsername?: string;
}

export async function findTeamLeaderActor(userId: string) {
  try {
    // 1. Check TeamMemberModel
    const teamMember = await TeamMemberModel.findOne({ userId }).lean();
    if (teamMember?.actorId) {
      const actor = await ActorModel.findOne({ _id: teamMember.actorId, deletedAt: null });
      if (actor) return actor;
    }

    // 2. Check TeamMembershipModel
    const membership = await TeamMembershipModel.findOne({ userId }).lean();
    if (membership?.teamId) {
      const teamDoc = await TeamModel.findById(membership.teamId).lean();
      if (teamDoc?.name) {
        const actor = await ActorModel.findOne({
          $or: [
            { displayName: teamDoc.name },
            { teamId: String(membership.teamId) },
            { handle: teamDoc.name.toLowerCase().replace(/[^a-z0-9]/g, "") },
          ],
          type: "team",
          deletedAt: null,
        });
        if (actor) return actor;
      }
    }

    // 3. Check UserModel
    const userDoc = await UserModel.findById(userId).lean();
    if (userDoc?.team) {
      const teamDoc = await TeamModel.findById(userDoc.team).lean();
      const teamName = teamDoc?.name || String(userDoc.team);
      const actor = await ActorModel.findOne({
        $or: [
          { displayName: teamName },
          { teamId: String(userDoc.team) },
          { handle: teamName.toLowerCase().replace(/[^a-z0-9]/g, "") },
        ],
        type: "team",
        deletedAt: null,
      });
      if (actor) return actor;
    }
  } catch {}
  return null;
}

export async function resolveDevotionAuthor(
  user: { sub: string; role?: string },
  specifiedActor?: string | null,
): Promise<{ error?: { status: number; message: string }; authorInfo?: ResolvedDevotionAuthor }> {
  let targetActor = specifiedActor?.trim() || null;
  const userRole = normalizeRole(user.role);
  const isSuperOrLeader = userRole === "super_admin" || userRole === "leader" || user.role === "admin";
  const isTeamLeader = userRole === "team_leader";

  // 1. If no actor was specified:
  // - If leader/super_admin: default to "fellow" official actor.
  // - If team leader: default to their team actor.
  // - If approved writer: default to personal ("me").
  if (!targetActor) {
    if (isSuperOrLeader) {
      targetActor = "fellow";
    } else if (isTeamLeader) {
      const teamActor = await findTeamLeaderActor(user.sub);
      if (teamActor) {
        targetActor = teamActor.handle || teamActor._id.toString();
      } else {
        targetActor = "me";
      }
    } else {
      targetActor = "me";
    }
  }

  // 2. Call canPostAs(req.user, targetActor)
  const { allowed, actor } = await canPostAs(user, targetActor);
  if (!allowed) {
    return {
      error: {
        status: 403,
        message: "You are not authorized to post as this actor",
      },
    };
  }

  // 3. Automatically populate devotion author info strictly from the validated actor:
  // - Official: author: "fellow", authorHandle: "fellow", actorType: "official", authorAvatar: actor.avatarUrl.
  // - Team: author: actor.displayName, authorHandle: actor.handle, actorType: "team", authorAvatar: actor.avatarUrl.
  // - User: author: user.fullName, authorHandle: profile?.username || user.fullName, actorType: "user", authorAvatar: user.profileImage.
  if (actor?.type === "official" || targetActor === "fellow") {
    return {
      authorInfo: {
        author: "fellow",
        authorHandle: "fellow",
        authorActorId: actor ? actor._id.toString() : "fellow",
        actorType: "official",
        authorAvatar: actor?.avatarUrl || OFFICIAL_ACTOR.avatarUrl,
        authorRole: "Executive Ministry",
        authorUsername: "fellow",
      },
    };
  }

  if (actor?.type === "team") {
    return {
      authorInfo: {
        author: actor.displayName,
        authorHandle: actor.handle,
        authorActorId: actor._id.toString(),
        actorType: "team",
        authorAvatar: actor.avatarUrl || undefined,
        authorRole: actor.displayName,
        authorUsername: actor.handle,
      },
    };
  }

  // User type / personal actor ("me")
  const [userDoc, profileDoc] = await Promise.all([
    UserModel.findById(user.sub).lean().catch(() => null),
    ProfileModel.findOne({ userId: user.sub }).lean().catch(() => null),
  ]);

  const fullName = userDoc?.fullName || "Fellowship Member";
  const username = profileDoc?.username || userDoc?.fullName || "member";

  return {
    authorInfo: {
      author: fullName,
      authorHandle: username,
      authorActorId: actor?._id ? actor._id.toString() : user.sub,
      actorType: "user",
      authorAvatar: userDoc?.profileImage || undefined,
      authorRole: profileDoc?.fellowshipRole || "Contributing Writer",
      authorUsername: username,
    },
  };
}

// ─── Helper: extract uploaded files from req.files ──────────────────
function getUploadedFiles(req: Request) {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  return {
    imageFile: files?.["image"]?.[0] || null,
    mediaFile: files?.["media"]?.[0] || null,
  };
}

export class DevotionController {
  // ─── CREATE ─────────────────────────────────────────────────────────
  static async createDevotion(req: Request, res: Response) {
    try {
      const parseResult = createDevotionSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parseResult.error.format(),
        });
      }

      const data = parseResult.data;
      const { imageFile, mediaFile } = getUploadedFiles(req);

      // ── Handle cover image ──────────────────────────────────────────
      let imageUrl: string | undefined = data.image;
      let imagePublicId: string | undefined;

      if (imageFile) {
        const result = await uploadDevotionImage(imageFile.buffer);
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      }

      if (!imageUrl) {
        imageUrl =
          "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80";
      }

      // ── Handle type-specific media ──────────────────────────────────
      let audioUrl: string | undefined = data.audioUrl;
      let audioPublicId: string | undefined;

      if (mediaFile && data.type === "voice") {
        const result = await uploadDevotionMedia(mediaFile.buffer, "voice");
        audioUrl = result.secure_url;
        audioPublicId = result.public_id;
      }

      // Validate that voice devotions have their audio
      if (data.type === "voice" && !audioUrl) {
        return res.status(400).json({
          success: false,
          message:
            "Voice devotions require an audio file (upload via 'media' field) or an 'audioUrl'",
        });
      }

      // Voice devotions always have a caption or transcript text
      const voiceCaption = data.caption || data.content;
      if (data.type === "voice" && !voiceCaption) {
        return res.status(400).json({
          success: false,
          message:
            "Voice devotions always require a caption or transcript text",
        });
      }

      // ── Author identification & attribution strictly via Actor ───
      const authReq = req as AuthRequest;
      const userId = authReq.user?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const specifiedActor = req.body.authorActorId || req.body.actorHandle;
      const resolution = await resolveDevotionAuthor(authReq.user!, specifiedActor);
      if (resolution.error) {
        return res.status(resolution.error.status).json({
          success: false,
          message: resolution.error.message,
        });
      }

      const authorInfo = resolution.authorInfo!;
      const authorId = new mongoose.Types.ObjectId(userId);

      const created = await DevotionModel.create({
        title: data.title,
        author: authorInfo.author,
        authorId,
        authorActorId: authorInfo.authorActorId,
        actorType: authorInfo.actorType,
        authorHandle: authorInfo.authorHandle,
        authorAvatar: authorInfo.authorAvatar,
        authorRole: authorInfo.authorRole,
        authorUsername: authorInfo.authorUsername,
        date: data.date,
        type: data.type,
        views: data.views ?? 0,
        likes: data.likes ?? 0,
        image: imageUrl,
        imagePublicId,
        content: data.type === "text" ? data.content : voiceCaption,
        audioUrl,
        audioPublicId,
        duration: data.duration,
        caption: voiceCaption,
        tags: data.tags,
        featured: data.featured ?? false,
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  // ─── GET ALL (paginated, filterable, searchable) ──────────────────
  static async getAllDevotions(req: Request, res: Response) {
    try {
      const options: DevotionQueryOptions = {
        type: req.query.type as string,
        featured: req.query.featured as string,
        tags: req.query.tags as string,
        page: req.query.page as string,
        limit: req.query.limit as string,
        search: req.query.search as string,
      };

      const { devotions, pagination } = await queryDevotions(options);

      // Format views/likes for frontend consumption
      const formatted = devotions.map((d: any) => ({
        ...d,
        viewsFormatted: formatCount(d.views),
        likesFormatted: formatCount(d.likes),
      }));

      return res.status(200).json({
        success: true,
        data: formatted,
        pagination,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  // ─── GET BY ID ────────────────────────────────────────────────────
  static async getDevotionById(req: Request, res: Response) {
    try {
      const id = routeParam(req.params.id);
      const devotion = await DevotionModel.findById(id).lean();
      if (!devotion) {
        return res
          .status(404)
          .json({ success: false, message: "Devotion not found" });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...devotion,
          viewsFormatted: formatCount(devotion.views),
          likesFormatted: formatCount(devotion.likes),
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  // ─── UPDATE ───────────────────────────────────────────────────────
  static async updateDevotion(req: Request, res: Response) {
    try {
      const id = routeParam(req.params.id);
      const existing = await DevotionModel.findById(id);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Devotion not found" });
      }

      const authReq = req as AuthRequest;
      const userId = authReq.user?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const userRole = normalizeRole(authReq.user?.role);
      const isSuperAdmin = userRole === "super_admin" || authReq.user?.role === "admin";
      const isCreator = existing.authorId && String(existing.authorId) === String(userId);

      let isActorAuthorized = false;
      if (existing.authorActorId) {
        const check = await canPostAs(
          { sub: userId, role: authReq.user?.role },
          existing.authorActorId
        );
        isActorAuthorized = check.allowed;
      }

      if (!isSuperAdmin && !isCreator && !isActorAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to modify this devotion",
        });
      }

      const parseResult = updateDevotionSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parseResult.error.format(),
        });
      }

      const data: any = { ...parseResult.data };
      const { imageFile, mediaFile } = getUploadedFiles(req);

      // Prevent manual text spoofing of author/actor info
      delete data.author;
      delete data.authorHandle;
      delete data.actorType;
      delete data.authorAvatar;
      delete data.authorRole;
      delete data.authorUsername;
      delete data.authorId;
      delete data.authorActorId;

      // If actor switch is requested, validate the new actor
      const specifiedActor = req.body.authorActorId || req.body.actorHandle;
      if (
        specifiedActor &&
        specifiedActor !== existing.authorActorId &&
        specifiedActor !== existing.authorHandle
      ) {
        const resolution = await resolveDevotionAuthor(authReq.user!, specifiedActor);
        if (resolution.error) {
          return res.status(resolution.error.status).json({
            success: false,
            message: resolution.error.message,
          });
        }
        if (resolution.authorInfo) {
          data.author = resolution.authorInfo.author;
          data.authorHandle = resolution.authorInfo.authorHandle;
          data.authorActorId = resolution.authorInfo.authorActorId;
          data.actorType = resolution.authorInfo.actorType;
          data.authorAvatar = resolution.authorInfo.authorAvatar;
          data.authorRole = resolution.authorInfo.authorRole;
          data.authorUsername = resolution.authorInfo.authorUsername;
        }
      }

      // ── Replace cover image if new one uploaded ─────────────────────
      if (imageFile) {
        const result = await uploadDevotionImage(imageFile.buffer);
        data.image = result.secure_url;
        data.imagePublicId = result.public_id;
      }

      // ── Replace media file if new one uploaded ──────────────────────
      if (mediaFile) {
        const type = data.type || existing.type;
        if (type === "voice") {
          const result = await uploadDevotionMedia(mediaFile.buffer, "voice");
          data.audioUrl = result.secure_url;
          data.audioPublicId = result.public_id;
        }
      }

      // Synchronize voice caption and content if needed
      if (data.caption && !data.content) {
        data.content = data.caption;
      }

      const updated = await DevotionModel.findByIdAndUpdate(id, data, {
        new: true,
      }).lean();

      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  // ─── DELETE (with Cloudinary cleanup) ─────────────────────────────
  static async deleteDevotion(req: Request, res: Response) {
    try {
      const id = routeParam(req.params.id);
      const devotion = await DevotionModel.findById(id);
      if (!devotion) {
        return res
          .status(404)
          .json({ success: false, message: "Devotion not found" });
      }

      // Clean up all uploaded assets from Cloudinary
      await deleteDevotionAssets(devotion);

      await DevotionModel.findByIdAndDelete(id);

      return res
        .status(200)
        .json({ success: true, message: "Devotion deleted" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  // ─── INCREMENT VIEWS ──────────────────────────────────────────────
  static async recordView(req: Request, res: Response) {
    try {
      const id = routeParam(req.params.id);
      const updated = await incrementViews(id);
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Devotion not found" });
      }
      return res.status(200).json({
        success: true,
        data: {
          views: updated.views,
          viewsFormatted: formatCount(updated.views),
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  // ─── LIKE / UNLIKE ────────────────────────────────────────────────
  static async likeDevotion(req: Request, res: Response) {
    try {
      const id = routeParam(req.params.id);
      const { action } = req.body; // "like" or "unlike"
      const isLike = action !== "unlike";

      const updated = await toggleLike(id, isLike);
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Devotion not found" });
      }
      return res.status(200).json({
        success: true,
        data: {
          likes: updated.likes,
          likesFormatted: formatCount(updated.likes),
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }
}

export default DevotionController;
