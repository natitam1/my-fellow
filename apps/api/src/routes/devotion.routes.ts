import { Router, Response, NextFunction } from "express";
import DevotionController from "../controllers/devotion.controller.js";
import WriterRequestController from "../controllers/writerRequest.controller.js";
import { uploadDevotionFiles } from "../middleware/upload.middleware.js";
import {
  requireAuth,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.middleware.js";
import { roleHasPermission, normalizeRole } from "../rbac/permissions.js";
import WriterRequestModel from "../models/writerRequest.model.js";
import DevotionModel from "../models/devotion.model.js";
import { routeParam } from "../utils/routeParam.js";
import { canPostAs } from "../modules/actors/actor.service.js";

const router = Router();

// ─── AUTHORIZATION GUARDS FOR DEVOTIONS ─────────────────────────────
export async function isApprovedDevotionAuthor(user: {
  sub: string;
  role?: string;
  permissions?: readonly string[];
}): Promise<boolean> {
  const normalized = normalizeRole(user.role);
  if (
    normalized === "super_admin" ||
    normalized === "leader" ||
    normalized === "team_leader" ||
    user.role === "admin" ||
    user.role === "coordinator" ||
    roleHasPermission(user.role, "sermons.media.manage", user.permissions)
  ) {
    return true;
  }

  const approved = await WriterRequestModel.exists({
    userId: user.sub,
    status: { $in: ["accepted", "approved"] },
  });

  return Boolean(approved);
}

async function requireDevotionAuthorPermission(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const isAllowed = await isApprovedDevotionAuthor(req.user);
  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message:
        "Forbidden: Only fellowship leaders, team leaders, and approved writers can author devotions.",
    });
  }

  return next();
}

async function requireDevotionEditPermission(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const isAllowed = await isApprovedDevotionAuthor(req.user);
  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message:
        "Forbidden: Only fellowship leaders, team leaders, and approved writers can modify devotions.",
    });
  }

  const role = req.user.role;
  const normalized = normalizeRole(role);
  if (
    normalized === "super_admin" ||
    role === "admin" ||
    roleHasPermission(role, "sermons.media.manage", req.user.permissions)
  ) {
    return next();
  }

  const id = routeParam(req.params.id);
  const existing = await DevotionModel.findById(id).select("authorId authorActorId");
  if (!existing) {
    return res.status(404).json({ success: false, message: "Devotion not found" });
  }

  // Creator can edit
  if (
    existing.authorId &&
    String(existing.authorId) === String(req.user.sub)
  ) {
    return next();
  }

  // Authorized actor member can edit
  if (existing.authorActorId) {
    const { allowed } = await canPostAs(
      { sub: req.user.sub, role: req.user.role },
      existing.authorActorId
    );
    if (allowed) {
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: You are not authorized to modify this devotion.",
  });
}

// ─── WRITER APPLICATION REQUESTS ──────────────────────────────────────
// POST /api/devotions/writer-requests — submit a writer application
router.post(
  "/writer-requests",
  requireAuth,
  WriterRequestController.create
);

// GET /api/devotions/writer-requests/me — fetch logged-in user's application
router.get(
  "/writer-requests/me",
  requireAuth,
  WriterRequestController.getMyRequest
);

// GET /api/devotions/writer-requests — list applications (admin)
router.get(
  "/writer-requests",
  requireAuth,
  requirePermission("sermons.media.manage"),
  WriterRequestController.getAll
);

// PATCH /api/devotions/writer-requests/:id/status — update status (admin)
router.patch(
  "/writer-requests/:id/status",
  requireAuth,
  requirePermission("sermons.media.manage"),
  WriterRequestController.updateStatus
);

// ─── DEVOTIONS ────────────────────────────────────────────────────────
// GET /api/devotions?type=voice&featured=true&tags=faith,hope&page=1&limit=10&search=peace
router.get("/", DevotionController.getAllDevotions);

// GET /api/devotions/:id
router.get("/:id", DevotionController.getDevotionById);

// POST /api/devotions/:id/view — record a view (public, no auth)
router.post("/:id/view", DevotionController.recordView);

// POST /api/devotions/:id/like — like/unlike (requires auth)
router.post("/:id/like", requireAuth, DevotionController.likeDevotion);

// POST /api/devotions — create (multipart: image + media fields)
router.post(
  "/",
  requireAuth,
  requireDevotionAuthorPermission,
  uploadDevotionFiles,
  DevotionController.createDevotion,
);

// PUT /api/devotions/:id — update (multipart: image + media fields)
router.put(
  "/:id",
  requireAuth,
  requireDevotionEditPermission,
  uploadDevotionFiles,
  DevotionController.updateDevotion,
);

// DELETE /api/devotions/:id — delete (cleans up Cloudinary assets)
router.delete(
  "/:id",
  requireAuth,
  requireDevotionEditPermission,
  DevotionController.deleteDevotion,
);

export default router;
