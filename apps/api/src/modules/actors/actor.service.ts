import mongoose from "mongoose";
import {
  ActorModel,
  TeamMemberModel,
  ProfileModel,
  MediaAssetModel,
  FollowModel,
  IActorDocument,
} from "../../models/social.models.js";
import { UserModel } from "../../models/user.model.js";
import { TeamModel } from "../../models/team.model.js";
import { TeamMembershipModel } from "../../models/rbac.model.js";
import { WriterRequestModel } from "../../models/writerRequest.model.js";
import { normalizeRole } from "../../rbac/permissions.js";

export const CANONICAL_TEAMS = [
  {
    teamId: "Bible Study",
    displayName: "Bible Study",
    handle: "biblestudy",
    bio: "Deep scripture study, weekly cell groups & discipleship.",
    avatarUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
    isVerified: true,
  },
  {
    teamId: "Evangelism",
    displayName: "Evangelism",
    handle: "evangelism",
    bio: "Sharing the Gospel across campus and university outreach.",
    avatarUrl: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=80",
    isVerified: true,
  },
  {
    teamId: "Worship",
    displayName: "Worship",
    handle: "worship",
    bio: "Acoustic teams, praise, and leading fellowship worship.",
    avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    isVerified: true,
  },
  {
    teamId: "I4U",
    displayName: "I4U",
    handle: "i4u",
    bio: "Care, encouragement, mutual support, and student welfare.",
    avatarUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    isVerified: true,
  },
  {
    teamId: "Media",
    displayName: "Media & Literature",
    handle: "media",
    bio: "Media, literature, publications, and fellowship media.",
    avatarUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
    isVerified: true,
  },
  {
    teamId: "Prayer",
    displayName: "Prayer",
    handle: "prayer",
    bio: "Intercession, morning prayers, and fellowship fasting nights.",
    avatarUrl: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
    isVerified: true,
  },
  {
    teamId: "Freshman",
    displayName: "Freshman",
    handle: "freshman",
    bio: "Welcoming and guiding new campus students in faith and life.",
    avatarUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80",
    isVerified: true,
  },
  {
    teamId: "Other",
    displayName: "Other Ministry",
    handle: "fellowship_ministry",
    bio: "General fellowship member and community ministries.",
    avatarUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80",
    isVerified: true,
  },
] as const;

export const OFFICIAL_ACTOR = {
  type: "official" as const,
  displayName: "fellow",
  handle: "fellow",
  bio: "Official account of 4 Kilo Christian Students Fellowship (AAU ECSF).",
  avatarUrl: "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
  isVerified: true,
};

export async function ensureDefaultActors(): Promise<void> {
  try {
    // 1. Ensure Official Actor
    const officialDocs = await ActorModel.find({
      $or: [
        { handle: OFFICIAL_ACTOR.handle },
        { handle: "4kilo_ecsf" },
        { type: "official" },
      ],
    });

    if (officialDocs.length === 0) {
      await ActorModel.create({
        type: OFFICIAL_ACTOR.type,
        displayName: OFFICIAL_ACTOR.displayName,
        handle: OFFICIAL_ACTOR.handle,
        bio: OFFICIAL_ACTOR.bio,
        avatarUrl: OFFICIAL_ACTOR.avatarUrl,
        isVerified: OFFICIAL_ACTOR.isVerified,
        deletedAt: null,
      });
    } else {
      const primary = officialDocs[0];
      primary.type = OFFICIAL_ACTOR.type;
      primary.displayName = OFFICIAL_ACTOR.displayName;
      primary.handle = OFFICIAL_ACTOR.handle;
      primary.bio = OFFICIAL_ACTOR.bio;
      primary.avatarUrl = OFFICIAL_ACTOR.avatarUrl;
      primary.isVerified = OFFICIAL_ACTOR.isVerified;
      primary.deletedAt = null;
      await primary.save();

      // Clean up any legacy duplicates
      if (officialDocs.length > 1) {
        for (let i = 1; i < officialDocs.length; i++) {
          await ActorModel.deleteOne({ _id: officialDocs[i]._id });
        }
      }
    }

    // 2. Ensure 8 Fellowship Team Actors
    for (const team of CANONICAL_TEAMS) {
      await ActorModel.findOneAndUpdate(
        { handle: team.handle },
        {
          $set: {
            type: "team",
            displayName: team.displayName,
            handle: team.handle,
            bio: team.bio,
            avatarUrl: team.avatarUrl,
            isVerified: team.isVerified,
            teamId: team.teamId,
            deletedAt: null,
          },
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error("[ensureDefaultActors] Error initializing actors:", err);
  }
}

export interface ActorSummaryPayload {
  id: string;
  type: "user" | "team" | "official";
  displayName: string;
  handle: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isVerified: boolean;
  teamId?: string | null;
  isDefault?: boolean;
  followersCount?: number;
}

async function isApprovedWriter(userId: string): Promise<boolean> {
  const isApproved = await WriterRequestModel.exists({
    userId,
    status: { $in: ["accepted", "approved"] },
  });
  return Boolean(isApproved);
}

async function isUserTeamLeaderAny(userId: string, userRole?: string): Promise<boolean> {
  // 1. TeamMembershipModel where role in leader/co_leader/admin/owner/team_leader
  const hasTeamMembership = await TeamMembershipModel.exists({
    userId,
    role: { $in: ["leader", "co_leader", "admin", "owner", "team_leader"] as any },
  });
  if (hasTeamMembership) return true;

  // 2. TeamMemberModel where role in owner/editor/leader/admin
  const hasTeamMember = await TeamMemberModel.exists({
    userId,
    role: { $in: ["owner", "editor", "leader", "admin"] as any },
  });
  if (hasTeamMember) return true;

  // 3. UserModel.team when user has role of leader
  const userDoc = await UserModel.findById(userId).lean();
  const normalized = normalizeRole(userRole || userDoc?.role);
  if (
    userDoc?.team &&
    (normalized === "leader" ||
      normalized === "team_leader" ||
      userDoc?.role === "leader" ||
      userDoc?.role === "team_leader")
  ) {
    return true;
  }

  return false;
}

async function isUserLeaderOfTeam(userId: string, actor: IActorDocument, userRole?: string): Promise<boolean> {
  // 1. Check TeamMembershipModel where userId and role in ["leader", "co_leader", "admin", "owner", "team_leader"]
  const memberships = await TeamMembershipModel.find({
    userId,
    role: { $in: ["leader", "co_leader", "admin", "owner", "team_leader"] as any },
  }).lean();

  if (memberships.length > 0) {
    const teamIds = memberships.map((m) => m.teamId);
    const teams = await TeamModel.find({ _id: { $in: teamIds } }).lean();
    for (const t of teams) {
      if (
        t.name.toLowerCase() === actor.displayName.toLowerCase() ||
        (actor.teamId && t.name.toLowerCase() === actor.teamId.toLowerCase()) ||
        t._id.toString() === actor.teamId ||
        t._id.toString() === actor._id.toString()
      ) {
        return true;
      }
    }
  }

  // 2. Check TeamMemberModel for that actor
  const hasActorMembership = await TeamMemberModel.exists({
    actorId: actor._id.toString(),
    userId,
    role: { $in: ["owner", "editor", "leader", "admin"] as any },
  });
  if (hasActorMembership) {
    return true;
  }

  // 3. Check UserModel.team when user has role of leader
  const userDoc = await UserModel.findById(userId).lean();
  const normalized = normalizeRole(userRole || userDoc?.role);
  if (
    userDoc?.team &&
    (normalized === "leader" ||
      normalized === "team_leader" ||
      userDoc?.role === "leader" ||
      userDoc?.role === "team_leader")
  ) {
    const teamDoc = await TeamModel.findById(userDoc.team).lean();
    if (
      teamDoc?.name?.toLowerCase() === actor.displayName.toLowerCase() ||
      (actor.teamId && teamDoc?.name?.toLowerCase() === actor.teamId.toLowerCase()) ||
      String(userDoc.team) === actor.teamId ||
      String(userDoc.team) === actor._id.toString()
    ) {
      return true;
    }
  }

  return false;
}

export async function canPostAs(
  user: { sub: string; role?: string },
  actorIdOrHandle: string
): Promise<{ allowed: boolean; actor?: IActorDocument | null }> {
  const userRole = normalizeRole(user.role);
  const isSuperOrLeader = userRole === "super_admin" || userRole === "leader" || user.role === "admin";

  // Check posting as "me"
  if (!actorIdOrHandle || actorIdOrHandle === "me") {
    if (isSuperOrLeader) {
      return { allowed: true, actor: null };
    }
    const isTeamLeader = await isUserTeamLeaderAny(user.sub, user.role);
    if (isTeamLeader) {
      return { allowed: true, actor: null };
    }
    const isWriter = await isApprovedWriter(user.sub);
    if (isWriter) {
      return { allowed: true, actor: null };
    }
    return { allowed: false, actor: null };
  }

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(actorIdOrHandle);
  const isOfficialAlias =
    actorIdOrHandle === "fellow" ||
    actorIdOrHandle === "official" ||
    actorIdOrHandle === OFFICIAL_ACTOR.handle ||
    actorIdOrHandle === "4kilo_ecsf";

  let actor: IActorDocument | null = (await ActorModel.findOne({
    $or: [
      ...(isObjectId ? [{ _id: actorIdOrHandle }] : []),
      { handle: actorIdOrHandle },
      { teamId: actorIdOrHandle },
      { displayName: actorIdOrHandle },
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
  })) as IActorDocument | null;

  if (!actor && isOfficialAlias) {
    try {
      await ensureDefaultActors();
      actor = (await ActorModel.findOne({
        $or: [{ handle: OFFICIAL_ACTOR.handle }, { type: "official" as const }, { handle: "fellow" }] as any,
        deletedAt: null,
      })) as IActorDocument | null;
    } catch {}

    if (!actor) {
      actor = new ActorModel({
        ...OFFICIAL_ACTOR,
        _id: new mongoose.Types.ObjectId(),
      }) as unknown as IActorDocument;
    }
  }

  if (!actor) {
    const canonical = CANONICAL_TEAMS.find(
      (t) =>
        t.handle.toLowerCase() === actorIdOrHandle.toLowerCase() ||
        t.displayName.toLowerCase() === actorIdOrHandle.toLowerCase() ||
        t.teamId.toLowerCase() === actorIdOrHandle.toLowerCase()
    );
    if (canonical) {
      actor = new ActorModel({
        ...canonical,
        type: "team",
        _id: new mongoose.Types.ObjectId(),
      }) as unknown as IActorDocument;
    }
  }

  if (!actor) {
    return { allowed: false, actor: null };
  }

  // Personal user actor
  if (actor.type === "user") {
    if (actor.userId !== user.sub) {
      return { allowed: false, actor };
    }
    if (isSuperOrLeader) {
      return { allowed: true, actor };
    }
    const isTeamLeader = await isUserTeamLeaderAny(user.sub, user.role);
    if (isTeamLeader) {
      return { allowed: true, actor };
    }
    const isWriter = await isApprovedWriter(user.sub);
    if (isWriter) {
      return { allowed: true, actor };
    }
    return { allowed: false, actor };
  }

  // Official actor ("fellow")
  if (actor.type === "official") {
    if (isSuperOrLeader) {
      return { allowed: true, actor };
    }
    const hasMembership = await TeamMemberModel.exists({
      actorId: actor._id.toString(),
      userId: user.sub,
      role: { $in: ["owner", "editor", "leader", "admin"] as any },
    });
    return { allowed: Boolean(hasMembership), actor };
  }

  // Team actor
  if (actor.type === "team") {
    if (isSuperOrLeader) {
      return { allowed: true, actor };
    }
    const isLeaderOfThisTeam = await isUserLeaderOfTeam(user.sub, actor, user.role);
    return { allowed: isLeaderOfThisTeam, actor };
  }

  return { allowed: false, actor };
}

export async function getPostableActors(
  user: { sub: string; role?: string }
): Promise<(ActorSummaryPayload & { isDefault?: boolean })[]> {
  await ensureDefaultActors();

  const [userDoc, profileDoc] = await Promise.all([
    UserModel.findById(user.sub).lean(),
    ProfileModel.findOne({ userId: user.sub }).lean(),
  ]);

  let userAvatarUrl: string | null = null;
  if (profileDoc?.avatarAssetId) {
    const asset = await MediaAssetModel.findById(profileDoc.avatarAssetId).lean();
    if (asset?.variants?.md || asset?.storageKey) {
      userAvatarUrl = asset.variants?.md || asset.storageKey;
    }
  } else if (userDoc?.profileImage) {
    userAvatarUrl = userDoc.profileImage;
  }

  const personalActor: ActorSummaryPayload = {
    id: "me",
    type: "user",
    displayName: profileDoc?.displayName || userDoc?.fullName || "Fellowship Member",
    handle: profileDoc?.username || (userDoc?.fullName || "member").toLowerCase().replace(/\s+/g, ""),
    avatarUrl: userAvatarUrl,
    bio: profileDoc?.bio || null,
    isVerified: Boolean(profileDoc?.isVerified),
  };

  const userRole = normalizeRole(user.role || userDoc?.role);
  const isSuperOrLeader = userRole === "super_admin" || userRole === "leader" || user.role === "admin";

  const { allowed: canPostMe } = await canPostAs(user, "me");

  // Fetch official actor
  const officialDoc = await ActorModel.findOne({
    $or: [{ handle: OFFICIAL_ACTOR.handle }, { type: "official" }],
    deletedAt: null,
  }).lean();

  const officialActor: ActorSummaryPayload | null = officialDoc
    ? {
        id: officialDoc._id.toString(),
        type: "official",
        displayName: officialDoc.displayName,
        handle: officialDoc.handle,
        avatarUrl: officialDoc.avatarUrl,
        bio: officialDoc.bio,
        isVerified: Boolean(officialDoc.isVerified),
        followersCount: officialDoc.followersCount || 0,
      }
    : null;

  // Fetch allowed team actors
  const teamActors = await ActorModel.find({ type: "team", deletedAt: null }).lean();
  const allowedTeamActors: ActorSummaryPayload[] = [];
  for (const t of teamActors) {
    const { allowed } = await canPostAs(user, t._id.toString());
    if (allowed) {
      allowedTeamActors.push({
        id: t._id.toString(),
        type: "team",
        displayName: t.displayName,
        handle: t.handle,
        avatarUrl: t.avatarUrl,
        bio: t.bio,
        isVerified: Boolean(t.isVerified),
        teamId: t.teamId,
        followersCount: t.followersCount || 0,
      });
    }
  }

  // Sort canonical teams consistently
  const canonicalHandles = CANONICAL_TEAMS.map((ct) => ct.handle as string);
  allowedTeamActors.sort((a, b) => {
    const idxA = canonicalHandles.indexOf(a.handle);
    const idxB = canonicalHandles.indexOf(b.handle);
    return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
  });

  // Sorting logic based on role:
  // 1. If leader/super_admin: Official actor `fellow` is index 0 with `isDefault: true`. Then teams, then "me".
  if (isSuperOrLeader) {
    const results: (ActorSummaryPayload & { isDefault?: boolean })[] = [];
    if (officialActor) {
      results.push({ ...officialActor, isDefault: true });
    }
    for (const team of allowedTeamActors) {
      results.push({ ...team, isDefault: false });
    }
    if (canPostMe) {
      results.push({ ...personalActor, isDefault: false });
    }
    if (results.length > 0 && !results.some((r) => r.isDefault)) {
      results[0].isDefault = true;
    }
    return results;
  }

  // 2. If team leader: Their team is index 0 with `isDefault: true`. Then "me".
  if (allowedTeamActors.length > 0) {
    const results: (ActorSummaryPayload & { isDefault?: boolean })[] = [];
    results.push({ ...allowedTeamActors[0], isDefault: true });
    for (let i = 1; i < allowedTeamActors.length; i++) {
      results.push({ ...allowedTeamActors[i], isDefault: false });
    }
    if (canPostMe) {
      results.push({ ...personalActor, isDefault: false });
    }
    return results;
  }

  // 3. If approved writer: "me" is index 0 with `isDefault: true`.
  if (canPostMe) {
    return [{ ...personalActor, isDefault: true }];
  }

  // 4. Regular member with no post permissions
  return [];
}

export async function ensureFollowOfficialActor(
  userId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  const followerId = String(userId);
  await ensureDefaultActors();

  const officialActor = await ActorModel.findOne({
    $or: [{ handle: OFFICIAL_ACTOR.handle }, { type: "official" }],
    deletedAt: null,
  });

  if (!officialActor) {
    console.warn("[ensureFollowOfficialActor] Official actor not found");
    return false;
  }

  const followeeId = officialActor._id.toString();
  if (followerId === followeeId) {
    return false;
  }

  const existing = await FollowModel.findOne({
    followerId,
    followeeId,
  });

  if (!existing) {
    try {
      await FollowModel.create({
        followerId,
        followeeId,
        status: "accepted",
      });
      await ActorModel.updateOne(
        { _id: officialActor._id },
        { $inc: { followersCount: 1 } }
      );
      return true;
    } catch (err: any) {
      if (err?.code === 11000) {
        return false;
      }
      throw err;
    }
  }

  return false;
}
