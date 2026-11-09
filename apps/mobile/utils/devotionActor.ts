import { Devotion } from "@/types/devotion.types";

export const OFFICIAL_FELLOWSHIP_LOGO =
  "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png";

export interface ResolvedDevotionActor {
  type: "official" | "team" | "user";
  displayName: string;
  handle: string;
  avatarUrl: string;
  role: string;
  isVerified: boolean;
  badgeText: "Official" | "TEAM" | null;
}

/**
 * Resolves the display attributes, badges, and avatars for devotion authors,
 * ensuring official fellowship identity and ministry team actors render correctly.
 */
export function resolveDevotionActor(
  devotion?: Partial<Devotion> | null
): ResolvedDevotionActor {
  if (!devotion) {
    return {
      type: "official",
      displayName: "fellow",
      handle: "@fellow",
      avatarUrl: OFFICIAL_FELLOWSHIP_LOGO,
      role: "Official Fellowship",
      isVerified: true,
      badgeText: "Official",
    };
  }

  const rawAuthor = (devotion.author || "").trim();
  const authorLower = rawAuthor.toLowerCase();
  const rawUsername = (devotion.authorUsername || "").trim();
  const usernameLower = rawUsername.toLowerCase();
  const rawRole = (devotion.authorRole || "").trim();
  const roleLower = rawRole.toLowerCase();

  const isOfficial =
    devotion.actorType === "official" ||
    authorLower === "fellow" ||
    usernameLower === "fellow" ||
    authorLower === "4 kilo fellowship" ||
    authorLower.includes("fellowship") ||
    authorLower.includes("4 kilo") ||
    authorLower.includes("official") ||
    usernameLower.includes("fellowship") ||
    usernameLower.includes("4kilo") ||
    devotion.authorId === "user-fellowship" ||
    roleLower.includes("official") ||
    roleLower.includes("executive ministry");

  if (isOfficial) {
    const displayName =
      authorLower === "fellow" || usernameLower === "fellow"
        ? "fellow"
        : rawAuthor || "fellow";

    const hasCustomAvatar =
      Boolean(devotion.authorAvatar) &&
      !devotion.authorAvatar?.includes("unsplash.com/photo-1541829070764");

    const avatarUrl = hasCustomAvatar
      ? (devotion.authorAvatar as string)
      : OFFICIAL_FELLOWSHIP_LOGO;

    const formattedHandle =
      rawUsername && rawUsername !== "4kilo_fellowship" && rawUsername !== "4kilo_ecsf"
        ? (rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`)
        : "@fellow";

    return {
      type: "official",
      displayName: "fellow",
      handle: formattedHandle,
      avatarUrl,
      role: rawRole || "Official Fellowship",
      isVerified: true,
      badgeText: "Official",
    };
  }

  const isTeam = devotion.actorType === "team" || Boolean(devotion.teamId);

  if (isTeam) {
    return {
      type: "team",
      displayName: rawAuthor || "Fellowship Ministry Team",
      handle:
        rawUsername ||
        `@${(rawAuthor || "team").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      avatarUrl: devotion.authorAvatar || "",
      role: rawRole || "Ministry Team",
      isVerified: true,
      badgeText: "TEAM",
    };
  }

  return {
    type: "user",
    displayName: rawAuthor || "Fellowship Member",
    handle: rawUsername || "@fellowship_writer",
    avatarUrl: devotion.authorAvatar || "",
    role: rawRole || "Fellowship Writer",
    isVerified: false,
    badgeText: null,
  };
}

/**
 * Handles navigation to author profile, whether personal user, ministry team, or official fellowship identity.
 */
export function navigateToDevotionAuthor(
  devotion: Devotion,
  router: { push: (route: any) => void }
) {
  const actor = resolveDevotionActor(devotion);

  if (actor.type === "team") {
    const targetTeamId = devotion.teamId || devotion.author;
    router.push({
      pathname: "/teams/[id]",
      params: { id: targetTeamId },
    });
    return;
  }

  if (actor.type === "official") {
    router.push({
      pathname: "/community/user/[id]",
      params: {
        id: "user-fellowship",
        name: actor.displayName,
        username: actor.handle,
        avatar: actor.avatarUrl,
        team: "Executive Ministry",
        department: "Campus Ministry Leadership",
      },
    });
    return;
  }

  // Personal user community profile
  const targetUserId = devotion.authorId || devotion._id;
  router.push({
    pathname: "/community/user/[id]",
    params: {
      id: targetUserId,
      name: actor.displayName,
      username: actor.handle,
      avatar: actor.avatarUrl || "",
      team: actor.role || "Fellowship Member",
      department: "Addis Ababa University",
    },
  });
}
