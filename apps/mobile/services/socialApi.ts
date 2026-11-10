import api from "./api";
import {
  ApiPost,
  FeedResponse,
  MutualFollowersData,
  PostableActor,
  ProfileDetail,
  SocialSearchResult,
  StoryHighlight,
  StreakMe,
  SuggestedUser,
  ThreadResponse,
  TrendingTag,
  UserMinistry,
  UserSummary,
} from "@/types/social.types";
import { Video, DEFAULT_VIDEOS } from "@/constants/videos";

/**
 * Helper to unwrap responses whether wrapped in ApiResponse ({ success, data })
 * or returned directly.
 */
function unwrap<T>(response: any): T {
  if (response?.data?.data !== undefined) {
    return response.data.data as T;
  }
  return response?.data as T;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds < 1) return "Video";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function normalizeContentVideo(item: any): Video {
  const thumbnail =
    typeof item.thumbnail === "string"
      ? item.thumbnail
      : item.thumbnail?.urls?.md ||
        item.thumbnail?.urls?.original ||
        "";
  const publishedAt = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString()
    : "Recently";

  return {
    id: String(item.id),
    title: item.title,
    desc: item.description || "",
    duration: item.duration || formatDuration(item.durationSeconds),
    thumbnail,
    videoUrl: item.videoUrl || item.playbackUrl,
    speaker: item.speaker,
    views: item.views,
    publishedAt,
  };
}

export const CANONICAL_FALLBACK_ACTORS: Record<
  string,
  PostableActor & {
    followerCount?: number;
    followersCount?: number;
    followingCount?: number;
    postCount?: number;
    postsCount?: number;
    isFollowing?: boolean;
  }
> = {
  fellow: {
    id: "fellow",
    type: "official",
    displayName: "Fellow",
    handle: "fellow",
    avatarUrl:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
    bio: "Official account of 4 Kilo Christian Students Fellowship (AAU ECSF). Rooted & Built Up in Him. Col 2:7 ✝️",
    isVerified: true,
    followerCount: 1240,
    followersCount: 1240,
    followingCount: 38,
    postCount: 56,
    postsCount: 56,
    isFollowing: true,
  },
  worship: {
    id: "worship",
    type: "team",
    displayName: "Worship Team",
    handle: "worship",
    avatarUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    bio: "Acoustic teams, praise, and leading fellowship worship.",
    isVerified: true,
    teamId: "Worship",
    followerCount: 890,
    followersCount: 890,
    followingCount: 12,
    postCount: 34,
    postsCount: 34,
    isFollowing: false,
  },
  biblestudy: {
    id: "biblestudy",
    type: "team",
    displayName: "Bible Study Team",
    handle: "biblestudy",
    avatarUrl:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
    bio: "Deep scripture study, weekly cell groups & discipleship.",
    isVerified: true,
    teamId: "Bible Study",
    followerCount: 780,
    followersCount: 780,
    followingCount: 12,
    postCount: 29,
    postsCount: 29,
    isFollowing: false,
  },
  evangelism: {
    id: "evangelism",
    type: "team",
    displayName: "Evangelism Team",
    handle: "evangelism",
    avatarUrl:
      "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=80",
    bio: "Sharing the Gospel across campus and university outreach.",
    isVerified: true,
    teamId: "Evangelism",
    followerCount: 650,
    followersCount: 650,
    followingCount: 12,
    postCount: 22,
    postsCount: 22,
    isFollowing: false,
  },
  i4u: {
    id: "i4u",
    type: "team",
    displayName: "I4U Team",
    handle: "i4u",
    avatarUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    bio: "Care, encouragement, mutual support, and student welfare.",
    isVerified: true,
    teamId: "I4U",
    followerCount: 540,
    followersCount: 540,
    followingCount: 12,
    postCount: 18,
    postsCount: 18,
    isFollowing: false,
  },
  media: {
    id: "media",
    type: "team",
    displayName: "Media & Literature",
    handle: "media",
    avatarUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
    bio: "Media, literature, publications, and fellowship media.",
    isVerified: true,
    teamId: "Media",
    followerCount: 610,
    followersCount: 610,
    followingCount: 12,
    postCount: 26,
    postsCount: 26,
    isFollowing: false,
  },
  prayer: {
    id: "prayer",
    type: "team",
    displayName: "Prayer Team",
    handle: "prayer",
    avatarUrl:
      "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
    bio: "Intercession, morning prayers, and fellowship fasting nights.",
    isVerified: true,
    teamId: "Prayer",
    followerCount: 720,
    followersCount: 720,
    followingCount: 12,
    postCount: 31,
    postsCount: 31,
    isFollowing: false,
  },
  freshman: {
    id: "freshman",
    type: "team",
    displayName: "Freshman Ministry",
    handle: "freshman",
    avatarUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80",
    bio: "Welcoming and guiding new campus students in faith and life.",
    isVerified: true,
    teamId: "Freshman",
    followerCount: 520,
    followersCount: 520,
    followingCount: 12,
    postCount: 27,
    postsCount: 27,
    isFollowing: false,
  },
  fellowship_ministry: {
    id: "fellowship_ministry",
    type: "team",
    displayName: "Other Ministry",
    handle: "fellowship_ministry",
    avatarUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80",
    bio: "General fellowship member and community ministries.",
    isVerified: true,
    teamId: "Other",
    followerCount: 430,
    followersCount: 430,
    followingCount: 12,
    postCount: 15,
    postsCount: 15,
    isFollowing: false,
  },
};

CANONICAL_FALLBACK_ACTORS["@fellow"] = CANONICAL_FALLBACK_ACTORS.fellow;
CANONICAL_FALLBACK_ACTORS["user-fellowship"] = CANONICAL_FALLBACK_ACTORS.fellow;
CANONICAL_FALLBACK_ACTORS["4kilofellowship"] = CANONICAL_FALLBACK_ACTORS.fellow;

export const socialApi = {
  /**
   * Fetch home / community feed (Following or For You)
   */
  async getFeed(
    type: "following" | "foryou" = "foryou",
    cursor?: string | null,
  ): Promise<FeedResponse> {
    const res = await api.get(`/v1/feed/${type}`, {
      params: cursor ? { cursor } : undefined,
    });
    const data = unwrap<any>(res);
    if (Array.isArray(data)) {
      return {
        items: data,
        nextCursor: null,
        hasMore: false,
      };
    }
    return data as FeedResponse;
  },

  /**
   * Upload an image file for community posts
   */
  async uploadMediaFile(
    uri: string,
    purpose: "post" | "avatar" | "cover" = "post",
  ): Promise<{ assetId: string; url: string }> {
    const formData = new FormData();
    const filename = uri.split("/").pop() || "upload.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("image", {
      uri,
      name: filename,
      type,
    } as any);
    formData.append("purpose", purpose);

    const res = await api.post("/v1/media/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    const data = unwrap<any>(res);
    return {
      assetId: data?.assetId || data?.asset?.id,
      url: data?.asset?.urls?.original || data?.asset?.urls?.lg || uri,
    };
  },

  /**
   * Create a new post, reply, or quote
   */
  async createPost(payload: {
    body: string;
    kind?: "post" | "reply" | "quote";
    parentId?: string;
    quotedId?: string;
    mediaAssetIds?: string[];
    authorActorId?: string;
  }): Promise<ApiPost> {
    const res = await api.post("/v1/posts", payload);
    return unwrap<ApiPost>(res);
  },

  /**
   * Get actors the authenticated member can post on behalf of
   */
  async getPostableActors(): Promise<PostableActor[]> {
    try {
      const res = await api.get("/v1/me/postable-actors");
      const data = unwrap<{ actors: PostableActor[] }>(res);
      return data?.actors || [];
    } catch (err) {
      console.warn("[getPostableActors] failed:", err);
      return [];
    }
  },

  /**
   * Fetch an actor profile by id or handle (e.g., 'fellow' or team handle/id)
   */
  async getActor(
    idOrHandle: string,
  ): Promise<
    PostableActor & {
      followerCount?: number;
      followersCount?: number;
      followingCount?: number;
      postCount?: number;
      postsCount?: number;
      isFollowing?: boolean;
    }
  > {
    const clean = idOrHandle.replace(/^@/, "").toLowerCase();
    try {
      const res = await api.get(`/v1/actors/${clean}`);
      const data = unwrap<any>(res);
      if (data && (data.id || data.handle)) {
        const isOfficial = data.type === "official" || data.handle === "fellow";
        return {
          id: data.id || data._id || clean,
          type: data.type || (isOfficial ? "official" : "team"),
          displayName: isOfficial ? "Fellow" : data.displayName,
          handle: data.handle || clean,
          avatarUrl: data.avatarUrl || (isOfficial ? CANONICAL_FALLBACK_ACTORS.fellow.avatarUrl : null),
          bio: data.bio || (isOfficial ? CANONICAL_FALLBACK_ACTORS.fellow.bio : null),
          isVerified: data.isVerified !== undefined ? Boolean(data.isVerified) : true,
          teamId: data.teamId,
          followerCount: data.followerCount ?? data.followersCount ?? (isOfficial ? 1240 : 890),
          followersCount: data.followersCount ?? data.followerCount ?? (isOfficial ? 1240 : 890),
          followingCount: data.followingCount ?? (isOfficial ? 38 : 12),
          postCount: data.postCount ?? data.postsCount ?? (isOfficial ? 56 : 0),
          postsCount: data.postsCount ?? data.postCount ?? (isOfficial ? 56 : 0),
          isFollowing:
            data.isFollowing !== undefined
              ? Boolean(data.isFollowing)
              : isOfficial
              ? true
              : false,
        };
      }
    } catch (err) {
      console.warn(`[getActor] /v1/actors/${clean} request failed, falling back:`, err);
    }

    const fallback =
      CANONICAL_FALLBACK_ACTORS[clean] ||
      CANONICAL_FALLBACK_ACTORS[idOrHandle] ||
      (clean.includes("fellow") ? CANONICAL_FALLBACK_ACTORS.fellow : undefined);

    if (fallback) {
      return fallback;
    }

    return {
      id: idOrHandle,
      type: "team",
      displayName: idOrHandle,
      handle: clean,
      isVerified: true,
      followerCount: 0,
      postCount: 0,
      followingCount: 0,
      isFollowing: false,
    };
  },

  /**
   * Fetch posts authored by an actor
   */
  async getActorPosts(
    idOrHandle: string,
    cursor?: string,
  ): Promise<FeedResponse> {
    const clean = idOrHandle.replace(/^@/, "").toLowerCase();
    try {
      const res = await api.get(`/v1/actors/${clean}/posts`, {
        params: cursor ? { cursor } : undefined,
      });
      const data = unwrap<any>(res);
      if (Array.isArray(data)) {
        return { items: data, nextCursor: null, hasMore: false };
      }
      if (data?.items) {
        return data as FeedResponse;
      }
    } catch (err) {
      console.warn(`[getActorPosts] /v1/actors/${clean}/posts failed:`, err);
    }

    // Secondary fallback: query profile posts endpoint
    try {
      const fallbackRes = await api.get(`/v1/profiles/${clean}/posts`, {
        params: cursor ? { cursor } : undefined,
      });
      const data = unwrap<any>(fallbackRes);
      if (Array.isArray(data)) {
        return { items: data, nextCursor: null, hasMore: false };
      }
      if (data?.items) {
        return data as FeedResponse;
      }
    } catch {}

    return { items: [], nextCursor: null, hasMore: false };
  },

  /**
   * Follow an actor via /v1/follows/:id
   */
  async followActor(
    idOrHandle: string,
  ): Promise<{ success: boolean; isFollowing?: boolean; followersCount?: number }> {
    const clean = idOrHandle.replace(/^@/, "");
    try {
      const res = await api.put(`/v1/follows/${clean}`);
      return unwrap(res) ?? { success: true, isFollowing: true };
    } catch {
      try {
        const postRes = await api.post(`/v1/follows/${clean}`);
        return unwrap(postRes) ?? { success: true, isFollowing: true };
      } catch {
        return this.followUser(clean);
      }
    }
  },

  /**
   * Unfollow an actor via /v1/follows/:id
   */
  async unfollowActor(
    idOrHandle: string,
  ): Promise<{ success: boolean; isFollowing?: boolean; followersCount?: number }> {
    const clean = idOrHandle.replace(/^@/, "");
    try {
      const res = await api.delete(`/v1/follows/${clean}`);
      return unwrap(res) ?? { success: true, isFollowing: false };
    } catch {
      return this.unfollowUser(clean);
    }
  },

  /**
   * Like a post
   */
  async likePost(
    id: string,
  ): Promise<{ success: boolean; likesCount?: number; isLiked?: boolean }> {
    try {
      const res = await api.put(`/v1/posts/${id}/like`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallback = await api.post(`/v1/posts/${id}/like`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/v1/posts/${id}`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Unlike a post
   */
  async unlikePost(
    id: string,
  ): Promise<{ success: boolean; likesCount?: number; isLiked?: boolean }> {
    const res = await api.delete(`/v1/posts/${id}/like`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Bookmark a post
   */
  async bookmarkPost(
    id: string,
  ): Promise<{ success: boolean; isBookmarked?: boolean }> {
    try {
      const res = await api.put(`/v1/posts/${id}/bookmark`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallback = await api.post(`/v1/posts/${id}/bookmark`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Unbookmark a post
   */
  async unbookmarkPost(
    id: string,
  ): Promise<{ success: boolean; isBookmarked?: boolean }> {
    const res = await api.delete(`/v1/posts/${id}/bookmark`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Repost a post
   */
  async repostPost(
    id: string,
  ): Promise<{ success: boolean; repostsCount?: number; isReposted?: boolean }> {
    try {
      const res = await api.put(`/v1/posts/${id}/repost`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallback = await api.post(`/v1/posts/${id}/repost`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Unrepost a post
   */
  async unrepostPost(
    id: string,
  ): Promise<{ success: boolean; repostsCount?: number; isReposted?: boolean }> {
    const res = await api.delete(`/v1/posts/${id}/repost`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Fetch a full post thread (ancestors, focused post, replies)
   */
  async getPostThread(id: string): Promise<ThreadResponse> {
    try {
      const res = await api.get(`/v1/posts/${id}/thread`);
      return unwrap<ThreadResponse>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Fallback to get single post
        const res = await api.get(`/v1/posts/${id}`);
        const post = unwrap<ApiPost>(res);
        return {
          post,
          ancestors: [],
          replies: [],
        };
      }
      throw err;
    }
  },

  /**
   * Who to follow suggestions
   */
  async getWhoToFollow(): Promise<SuggestedUser[]> {
    try {
      const res = await api.get("/v1/suggestions/users");
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.users || data?.items || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/v1/users/suggestions");
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.users || data?.items || [];
      }
      throw err;
    }
  },

  /**
   * Follow a user
   */
  async followUser(
    id: string,
  ): Promise<{ success: boolean; isFollowing?: boolean; followersCount?: number }> {
    try {
      const res = await api.put(`/v1/users/${id}/follow`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallback = await api.post(`/v1/users/${id}/follow`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(
    id: string,
  ): Promise<{ success: boolean; isFollowing?: boolean; followersCount?: number }> {
    const res = await api.delete(`/v1/users/${id}/follow`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Dismiss a suggestion card
   */
  async dismissSuggestion(id: string): Promise<{ success: boolean }> {
    try {
      const res = await api.delete(`/v1/suggestions/users/${id}`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.delete(`/v1/users/${id}/suggestions`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Get user profile details
   */
  async getUserProfile(usernameOrId: string): Promise<ProfileDetail> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}`);
      return unwrap<ProfileDetail>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/profile`);
        return unwrap<ProfileDetail>(fallback);
      }
      throw err;
    }
  },

  /**
   * Get user posts
   */
  async getUserPosts(usernameOrId: string): Promise<ApiPost[]> {
    const res = await api.get(`/v1/profiles/${usernameOrId}/posts`);
    const data = unwrap<any>(res);
    return Array.isArray(data) ? data : data?.items || data?.posts || [];
  },

  /**
   * Get user liked posts
   */
  async getUserLikedPosts(usernameOrId: string): Promise<ApiPost[]> {
    const res = await api.get(`/v1/profiles/${usernameOrId}/likes`);
    const data = unwrap<any>(res);
    return Array.isArray(data) ? data : data?.items || data?.posts || [];
  },

  /**
   * Get user highlights
   */
  async getUserHighlights(usernameOrId: string): Promise<StoryHighlight[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/highlights`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.items || data?.highlights || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/highlights`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.items || data?.highlights || [];
      }
      throw err;
    }
  },

  /**
   * Get user ministries and service schedule
   */
  async getUserMinistries(usernameOrId: string): Promise<UserMinistry[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/ministries`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.items || data?.ministries || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/ministries`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.items || data?.ministries || [];
      }
      throw err;
    }
  },

  /**
   * Get user followers list
   */
  async getUserFollowers(usernameOrId: string): Promise<UserSummary[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/followers`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.items || data?.users || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/followers`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.items || data?.users || [];
      }
      throw err;
    }
  },

  /**
   * Get user following list
   */
  async getUserFollowing(usernameOrId: string): Promise<UserSummary[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/following`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.items || data?.users || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/following`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.items || data?.users || [];
      }
      throw err;
    }
  },

  /**
   * Get mutual followers between viewer and candidate
   */
  async getUserMutuals(usernameOrId: string): Promise<MutualFollowersData> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/mutuals`);
      const data = unwrap<any>(res);
      if (Array.isArray(data)) {
        return { total: data.length, users: data };
      }
      const list = data?.items || data?.users || [];
      return {
        total: data?.total ?? list.length,
        users: list,
      };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/mutuals`);
        const data = unwrap<any>(fallback);
        if (Array.isArray(data)) {
          return { total: data.length, users: data };
        }
        const list = data?.items || data?.users || [];
        return {
          total: data?.total ?? list.length,
          users: list,
        };
      }
      throw err;
    }
  },

  /**
   * Curated media library / videos
   */
  async getContentVideos(): Promise<Video[]> {
    try {
      const res = await api.get("/v1/content/videos");
      const data = unwrap<any>(res);
      const items = Array.isArray(data) ? data : data?.videos || data?.items || [];
      const normalized = items.map(normalizeContentVideo);
      if (normalized.length === 0) return DEFAULT_VIDEOS;
      const hasLivingHope = normalized.some((v: Video) => v.id === "living-hope" || v.title?.toLowerCase().includes("living hope"));
      return hasLivingHope ? normalized : [DEFAULT_VIDEOS[0], ...normalized];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        try {
          const fallback = await api.get("/content/videos");
          const data = unwrap<any>(fallback);
          const items = Array.isArray(data) ? data : data?.videos || data?.items || [];
          const normalized = items.map(normalizeContentVideo);
          if (normalized.length === 0) return DEFAULT_VIDEOS;
          const hasLivingHope = normalized.some((v: Video) => v.id === "living-hope" || v.title?.toLowerCase().includes("living hope"));
          return hasLivingHope ? normalized : [DEFAULT_VIDEOS[0], ...normalized];
        } catch {
          return DEFAULT_VIDEOS;
        }
      }
      return DEFAULT_VIDEOS;
    }
  },

  async createContentVideo(input: {
    title: string;
    description?: string;
    video: { uri: string; name: string; type: string };
    thumbnail?: { uri: string; name: string; type: string };
  }): Promise<Video> {
    const formData = new FormData();
    formData.append("title", input.title);
    if (input.description) formData.append("description", input.description);
    formData.append("video", input.video as any);
    if (input.thumbnail) formData.append("thumbnail", input.thumbnail as any);

    const res = await api.post("/v1/content/videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 180000,
    });
    return normalizeContentVideo(unwrap<any>(res));
  },

  /**
   * Current user's devotion & prayer streak
   */
  async getStreakMe(): Promise<StreakMe> {
    try {
      const res = await api.get("/v1/streak");
      return unwrap<StreakMe>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/v1/streaks/me");
        return unwrap<StreakMe>(fallback);
      }
      throw err;
    }
  },

  /**
   * Check in daily streak
   */
  async checkInStreak(): Promise<StreakMe> {
    try {
      const res = await api.post("/v1/streak/check-in");
      return unwrap<StreakMe>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.post("/v1/streaks/checkin");
        return unwrap<StreakMe>(fallback);
      }
      throw err;
    }
  },

  /**
   * Unread notification count
   */
  async getUnreadNotificationsCount(): Promise<{ count: number }> {
    try {
      const res = await api.get("/v1/notifications/unread-count");
      const data = unwrap<any>(res);
      return typeof data === "number"
        ? { count: data }
        : { count: data?.count ?? 0 };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/notifications/unread-count");
        const data = unwrap<any>(fallback);
        return typeof data === "number"
          ? { count: data }
          : { count: data?.count ?? 0 };
      }
      throw err;
    }
  },

  /**
   * Social search for users, posts, or tags
   */
  async searchSocial(
    query: string,
    type: "all" | "people" | "posts" = "all",
  ): Promise<SocialSearchResult> {
    const res = await api.get("/v1/search", {
      params: { q: query, type },
    });
    const data = unwrap<any>(res);
    return {
      people: data?.people || data?.users || [],
      posts: data?.posts || [],
      tags: data?.tags || [],
    };
  },

  /**
   * Trending hashtags
   */
  async getTrendingTags(): Promise<TrendingTag[]> {
    try {
      const res = await api.get("/v1/trending/tags");
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.tags || data?.items || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/v1/search/trending");
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.tags || data?.items || [];
      }
      throw err;
    }
  },
};
