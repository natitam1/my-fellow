import { useMemo } from "react";
import { useCommunityStore, MemberProfile } from "@/stores/community.store";

export interface ProfileSeedParams {
  id?: string;
  name?: string;
  username?: string;
  avatar?: string;
  blurhash?: string;
  team?: string;
  department?: string;
  srcSize?: string;
  streakDays?: string | number;
}

export type ProfileSeed = ProfileSeedParams;

export interface UseProfileResult {
  data: MemberProfile;
  isPlaceholder: boolean;
}

/**
 * Pure resolution logic for Profile Seed (Section 5.3).
 * Tested independently of React hook lifecycle.
 */
export function resolveProfileSeed(
  seed: ProfileSeedParams,
  storeMember?: MemberProfile
): UseProfileResult {
  if (storeMember) {
    return {
      data: storeMember,
      isPlaceholder: false,
    };
  }

  const memberId = seed.id || "user-unknown";
  const cleanId = memberId.replace(/^@/, "").toLowerCase();
  const displayName = seed.name?.trim() || "Fellowship Member";
  let handle =
    seed.username?.trim() ||
    (seed.id ? `@${cleanId}` : "@fellowship_student");
  if (handle && !handle.startsWith("@")) {
    handle = `@${handle}`;
  }

  const isOfficial =
    cleanId === "fellow" ||
    cleanId === "user-fellowship" ||
    cleanId === "4kilofellowship" ||
    cleanId === "6aec43ef64e7e1d073d0bc1c" ||
    displayName.toLowerCase() === "fellow" ||
    displayName.toLowerCase().includes("4 kilo") ||
    handle.toLowerCase() === "@fellow" ||
    handle.toLowerCase().includes("4kilo");

  const isWorship = cleanId === "worship" || handle.toLowerCase() === "@worship";
  const isBibleStudy = cleanId === "biblestudy" || handle.toLowerCase() === "@biblestudy";
  const isEvangelism = cleanId === "evangelism" || handle.toLowerCase() === "@evangelism";
  const isPrayer = cleanId === "prayer" || handle.toLowerCase() === "@prayer";
  const isI4U = cleanId === "i4u" || handle.toLowerCase() === "@i4u";
  const isMedia = cleanId === "media" || handle.toLowerCase() === "@media";
  const isFreshman = cleanId === "freshman" || handle.toLowerCase() === "@freshman";
  const isTeam =
    isWorship || isBibleStudy || isEvangelism || isPrayer || isI4U || isMedia || isFreshman;

  let teamDisplayName = displayName;
  let teamBio = "";
  let teamAvatar = seed.avatar;
  let teamFollowers = 890;
  let teamFollowing = 12;

  if (isWorship) {
    teamDisplayName = "Worship Team";
    teamBio = "Acoustic teams, praise, and leading fellowship worship.";
    teamAvatar = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80";
    teamFollowers = 890;
  } else if (isBibleStudy) {
    teamDisplayName = "Bible Study Team";
    teamBio = "Deep scripture study, weekly cell groups & discipleship.";
    teamAvatar = "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80";
    teamFollowers = 780;
  } else if (isEvangelism) {
    teamDisplayName = "Evangelism Team";
    teamBio = "Sharing the Gospel across campus and university outreach.";
    teamAvatar = "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=80";
    teamFollowers = 650;
  } else if (isPrayer) {
    teamDisplayName = "Prayer Team";
    teamBio = "Intercession, morning prayers, and fellowship fasting nights.";
    teamAvatar = "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80";
    teamFollowers = 720;
  } else if (isI4U) {
    teamDisplayName = "I4U Team";
    teamBio = "Care, encouragement, mutual support, and student welfare.";
    teamAvatar = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80";
    teamFollowers = 540;
  } else if (isMedia) {
    teamDisplayName = "Media & Literature";
    teamBio = "Media, literature, publications, and fellowship media.";
    teamAvatar = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80";
    teamFollowers = 610;
  } else if (isFreshman) {
    teamDisplayName = "Freshman Ministry";
    teamBio = "Welcoming and guiding new campus students in faith and life.";
    teamAvatar = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80";
    teamFollowers = 520;
  }

  const profile: MemberProfile = {
    id: isOfficial ? "fellow" : memberId,
    fullName: isOfficial ? "Fellow" : isTeam ? teamDisplayName : displayName,
    handle: isOfficial ? "@fellow" : isTeam ? `@${cleanId}` : handle,
    avatar:
      seed.avatar ||
      (isOfficial
        ? require("@/assets/images/app-icon.png")
        : isTeam
        ? teamAvatar
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"),
    banner: isOfficial
      ? "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
      : isTeam
      ? teamAvatar
      : null,
    team: isOfficial
      ? "Official Fellowship"
      : isTeam
      ? teamDisplayName
      : (seed.team || "Campus Ministry"),
    department: isOfficial
      ? "Campus Ministry Leadership"
      : isTeam
      ? "Fellowship Ministry Team"
      : (seed.department || "Addis Ababa University"),
    academicYear: isOfficial || isTeam ? "AAU ECSF" : "",
    bio: isOfficial
      ? "Official account of 4 Kilo Christian Students Fellowship (AAU ECSF)..."
      : isTeam
      ? teamBio
      : "",
    streakDays: isOfficial ? 142 : isTeam ? 45 : 0,
    followersCount: isOfficial ? 1240 : isTeam ? teamFollowers : 0,
    followingCount: isOfficial ? 38 : isTeam ? teamFollowing : 0,
    postsCount: isOfficial ? 56 : isTeam ? 24 : 0,
    isFollowing: isOfficial ? true : false,
    isVerified: isOfficial || isTeam ? true : false,
    isActor: isOfficial || isTeam,
    actorType: isOfficial ? "official" : isTeam ? "team" : "user",
    location: isOfficial || isTeam ? "Addis Ababa University 4 Kilo Campus" : undefined,
    joinedDate: undefined,
    mutualFollowers: undefined,
  };

  return {
    data: profile,
    isPlaceholder: !isOfficial && !isTeam,
  };
}

/**
 * Seed, Cache, Revalidate hook for Profile Screen (Section 5.3).
 *
 * Frame 1: Guaranteed to provide a populated MemberProfile using either
 * 1) Full cached profile from Zustand store
 * 2) Instant route-param seed passed from the tapped entry point
 * 3) Deterministic avatar and naming fallbacks
 *
 * This completely eliminates white flashes, layout shifts, or loading spinners
 * before the header is visible.
 */
export function useProfile(seed: ProfileSeedParams): UseProfileResult {
  const memberId = seed.id || "user-unknown";
  const cleanId = memberId.replace(/^@/, "").toLowerCase();
  const storeMember = useCommunityStore((s) =>
    s.members[memberId] ||
    s.members[cleanId] ||
    s.members[`@${cleanId}`] ||
    (cleanId === "fellow" ||
    cleanId === "user-fellowship" ||
    cleanId === "4kilofellowship" ||
    cleanId === "6aec43ef64e7e1d073d0bc1c"
      ? s.members["fellow"] || s.members["@fellow"] || s.members["user-fellowship"]
      : undefined)
  );

  return useMemo(() => {
    return resolveProfileSeed(seed, storeMember);
  }, [storeMember, seed]);
}
