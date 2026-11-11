import { api } from "./api";
import {
  Post,
  FeedResponse,
  ThreadResponse,
  ActorSummary,
  FeedTab,
  MediaAssetVariant,
} from "@/types/community";

const DEFAULT_POSTS: Post[] = [
  {
    id: "fellowship-official-welcome",
    kind: "post",
    author: {
      id: "official-fellow-actor",
      username: "fellow",
      displayName: "Fellow",
      avatar: {
        urls: {
          sm: "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
          md: "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
          lg: "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
          original: "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
        },
      },
      isVerified: true,
      fellowshipRole: "Official Fellowship",
      ministryBadge: "4 Kilo ECSF",
    },
    authorActor: {
      id: "official-fellow-actor",
      type: "official",
      displayName: "Fellow",
      handle: "fellow",
      avatarUrl: "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
      bio: "Official account of 4 Kilo Christian Students Fellowship (AAU ECSF). Rooted in Christ, transforming lives across campus.",
      isVerified: true,
      followersCount: 1240,
    },
    createdByUserId: "admin-1",
    body: "Welcome to the new digital home of 4 Kilo Christian Students Fellowship (AAU ECSF)! ✨\n\n“For where two or three gather in my name, there am I with them.” — Matthew 18:20\n\nConnect with fellowship ministries, share prayer requests, stay updated on campus gatherings, and encourage one another daily in Christ. #fellowship #announcement #4kilo",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    media: [
      {
        id: "media-fellowship-welcome",
        kind: "image",
        width: 1200,
        height: 675,
        urls: {
          sm: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=80",
          md: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",
          lg: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&q=80",
          original: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&q=80",
        },
        altText: "Fellowship gathering at 4 Kilo campus",
      },
    ],
    counts: {
      replies: 14,
      reposts: 28,
      likes: 142,
      quotes: 5,
    },
    viewer: {
      liked: false,
      reposted: false,
      bookmarked: false,
    },
  },
  {
    id: "prayer-team-morning-watch",
    kind: "post",
    author: {
      id: "prayer-team-actor",
      username: "prayer",
      displayName: "Prayer Team",
      avatar: {
        urls: {
          sm: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
          md: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
          lg: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
          original: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
        },
      },
      isVerified: true,
      fellowshipRole: "Fellowship Team",
      ministryBadge: "Prayer Ministry",
    },
    authorActor: {
      id: "prayer-team-actor",
      type: "team",
      displayName: "Prayer Team",
      handle: "prayer",
      avatarUrl: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
      bio: "Intercession, morning campus prayers, fasting nights, and standing in the gap for students.",
      isVerified: true,
      teamId: "Prayer",
      followersCount: 520,
    },
    body: "Morning Campus Prayer Alert 🌅\n\nBrothers and sisters, join us tomorrow at 6:30 AM behind the main science library for morning devotion and campus intercession. Please drop your prayer requests below so we can lift you up by name. #prayer #prayerrequest #campusministry",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    media: [],
    counts: {
      replies: 19,
      reposts: 8,
      likes: 67,
      quotes: 2,
    },
    viewer: {
      liked: false,
      reposted: false,
      bookmarked: false,
    },
  },
  {
    id: "worship-team-rehearsal",
    kind: "post",
    author: {
      id: "worship-team-actor",
      username: "worship",
      displayName: "Worship Team",
      avatar: {
        urls: {
          sm: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
          md: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
          lg: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
          original: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
        },
      },
      isVerified: true,
      fellowshipRole: "Fellowship Team",
      ministryBadge: "Worship Team",
    },
    authorActor: {
      id: "worship-team-actor",
      type: "team",
      displayName: "Worship Team",
      handle: "worship",
      avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
      bio: "Acoustic praise, instrumentalists, choir, and leading fellowship worship.",
      isVerified: true,
      teamId: "Worship",
      followersCount: 890,
    },
    body: "“Let the message of Christ dwell among you richly as you teach and admonish one another with all wisdom through psalms, hymns, and songs from the Spirit.” — Colossians 3:16 🎶\n\nPreparation for Friday Night Worship Encounter is in full swing! See you this Friday at 5:30 PM. #worship #fellowship #praise",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    media: [
      {
        id: "media-worship-acoustic",
        kind: "image",
        width: 1200,
        height: 800,
        urls: {
          sm: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
          md: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
          lg: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80",
          original: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80",
        },
        altText: "Worship team leading praise",
      },
    ],
    counts: {
      replies: 7,
      reposts: 15,
      likes: 95,
      quotes: 1,
    },
    viewer: {
      liked: false,
      reposted: false,
      bookmarked: false,
    },
  },
  {
    id: "biblestudy-cell-groups",
    kind: "post",
    author: {
      id: "biblestudy-team-actor",
      username: "biblestudy",
      displayName: "Bible Study Team",
      avatar: {
        urls: {
          sm: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
          md: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
          lg: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
          original: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
        },
      },
      isVerified: true,
      fellowshipRole: "Fellowship Team",
      ministryBadge: "Bible Study",
    },
    authorActor: {
      id: "biblestudy-team-actor",
      type: "team",
      displayName: "Bible Study Team",
      handle: "biblestudy",
      avatarUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
      bio: "Deep scripture study, weekly cell groups, discipleship, and foundational teachings.",
      isVerified: true,
      teamId: "Bible Study",
      followersCount: 740,
    },
    body: "This semester's study on the Book of Ephesians kicks off this Tuesday across all dorm cell groups. Grab your study guide from your wing leader or check the fellowship catalog! #biblestudy #ephesians #discipleship",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    media: [],
    counts: {
      replies: 11,
      reposts: 6,
      likes: 54,
      quotes: 0,
    },
    viewer: {
      liked: false,
      reposted: false,
      bookmarked: false,
    },
  },
];

const CANONICAL_FALLBACK_ACTORS: ActorSummary[] = [
  {
    id: "actor-fellow",
    type: "official",
    displayName: "Fellow",
    handle: "fellow",
    avatarUrl: "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
    bio: "Official account of 4 Kilo Christian Students Fellowship (AAU ECSF). Rooted in Christ, transforming lives across campus.",
    isVerified: true,
    followersCount: 1240,
    postsCount: 18,
    isFollowing: true,
  },
  {
    id: "actor-worship",
    type: "team",
    displayName: "Worship Team",
    handle: "worship",
    avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    bio: "Acoustic praise, instrumentalists, choir, and leading fellowship worship.",
    isVerified: true,
    teamId: "Worship",
    followersCount: 890,
    postsCount: 32,
    isFollowing: false,
  },
  {
    id: "actor-prayer",
    type: "team",
    displayName: "Prayer Team",
    handle: "prayer",
    avatarUrl: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
    bio: "Intercession, morning campus prayers, fasting nights, and standing in the gap for students.",
    isVerified: true,
    teamId: "Prayer",
    followersCount: 520,
    postsCount: 45,
    isFollowing: true,
  },
  {
    id: "actor-biblestudy",
    type: "team",
    displayName: "Bible Study Team",
    handle: "biblestudy",
    avatarUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&q=80",
    bio: "Deep scripture study, weekly cell groups, discipleship, and foundational teachings.",
    isVerified: true,
    teamId: "Bible Study",
    followersCount: 740,
    postsCount: 26,
    isFollowing: false,
  },
  {
    id: "actor-media",
    type: "team",
    displayName: "Media & Literature Team",
    handle: "media",
    avatarUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
    bio: "Fellowship media production, publications, social content, and technical creative support.",
    isVerified: true,
    teamId: "Media",
    followersCount: 610,
    postsCount: 29,
    isFollowing: false,
  },
  {
    id: "actor-evangelism",
    type: "team",
    displayName: "Evangelism Team",
    handle: "evangelism",
    avatarUrl: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=80",
    bio: "Sharing the Gospel across campus, university outreaches, and soul winning.",
    isVerified: true,
    teamId: "Evangelism",
    followersCount: 430,
    postsCount: 15,
    isFollowing: false,
  },
  {
    id: "actor-freshman",
    type: "team",
    displayName: "Freshman Ministry Team",
    handle: "freshman",
    avatarUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80",
    bio: "Welcoming and guiding new campus students in faith, community, and university life.",
    isVerified: true,
    teamId: "Freshman",
    followersCount: 480,
    postsCount: 12,
    isFollowing: false,
  },
  {
    id: "actor-i4u",
    type: "team",
    displayName: "I4U Team",
    handle: "i4u",
    avatarUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    bio: "Student welfare, emergency support, mutual encouragement, and Christ-like care.",
    isVerified: true,
    teamId: "I4U",
    followersCount: 390,
    postsCount: 8,
    isFollowing: false,
  },
];

/**
 * Fetch timeline feed with support for tab filtering, pagination, and tags
 */
export async function getCommunityFeed(params: {
  tab?: FeedTab;
  tag?: string;
  cursor?: string;
  limit?: number;
}): Promise<FeedResponse> {
  const { tab = "all", tag, cursor, limit = 20 } = params;

  try {
    let endpoint = "/v1/feed";
    const query = new URLSearchParams();
    if (tab && tab !== "all") query.set("tab", tab);
    if (tag) query.set("tag", tag);
    if (cursor) query.set("cursor", cursor);
    if (limit) query.set("limit", String(limit));

    const queryString = query.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    const res = await api.get(url);
    const data = res.data;

    if (data && Array.isArray(data.items)) {
      if (data.items.length === 0 && !cursor) {
        // Filter fallback posts according to tab
        return {
          items: filterFallbackPosts(DEFAULT_POSTS, tab, tag),
          nextCursor: null,
          hasMore: false,
        };
      }
      return {
        items: data.items,
        nextCursor: data.nextCursor || null,
        hasMore: Boolean(data.hasMore),
      };
    }

    return {
      items: filterFallbackPosts(DEFAULT_POSTS, tab, tag),
      nextCursor: null,
      hasMore: false,
    };
  } catch (err) {
    console.warn("[getCommunityFeed] Failed to load remote feed, using fallback:", err);
    return {
      items: filterFallbackPosts(DEFAULT_POSTS, tab, tag),
      nextCursor: null,
      hasMore: false,
    };
  }
}

function filterFallbackPosts(posts: Post[], tab: FeedTab, tag?: string): Post[] {
  let list = [...posts];

  if (tab === "announcements") {
    list = list.filter(
      (p) =>
        p.authorActor?.type === "official" ||
        p.body?.toLowerCase().includes("#announcement") ||
        p.authorActor?.type === "team"
    );
  } else if (tab === "prayer_requests") {
    list = list.filter(
      (p) =>
        p.body?.toLowerCase().includes("#prayer") ||
        p.body?.toLowerCase().includes("prayer") ||
        p.authorActor?.teamId === "Prayer"
    );
  } else if (tab === "following") {
    list = list.filter((p) => p.authorActor?.isFollowing || p.authorActor?.type === "official");
  }

  if (tag) {
    const cleanTag = tag.toLowerCase().replace(/^#/, "");
    list = list.filter((p) => p.body?.toLowerCase().includes(`#${cleanTag}`));
  }

  return list;
}

/**
 * Fetch single post with discussion thread and replies
 */
export async function getPostThread(id: string): Promise<ThreadResponse> {
  try {
    const res = await api.get(`/v1/posts/${id}/thread`);
    if (res.data && res.data.post) {
      return res.data;
    }
  } catch (err) {
    console.warn(`[getPostThread] Failed to fetch thread for ${id}:`, err);
  }

  // Fallback to local item
  const found = DEFAULT_POSTS.find((p) => p.id === id);
  const fallbackPost: Post = found || {
    id,
    kind: "post",
    author: {
      id: "fellow-member-sample",
      username: "brother_yonas",
      displayName: "Yonas Mengistu",
      avatar: null,
      isVerified: false,
      fellowshipRole: "Fellowship Member",
      ministryBadge: "Civil Engineering '26",
    },
    body: "Gracious are the words spoken in truth and love. Thankful for today's campus fellowship gathering! #fellowship #faith",
    createdAt: new Date().toISOString(),
    media: [],
    counts: { replies: 2, reposts: 1, likes: 18, quotes: 0 },
    viewer: { liked: false, reposted: false, bookmarked: false },
  };

  const sampleReplies: Post[] = [
    {
      id: `reply-${id}-1`,
      kind: "reply",
      author: {
        id: "fellow-reply-1",
        username: "ruth_t",
        displayName: "Ruth Tadesse",
        avatar: null,
        isVerified: false,
        fellowshipRole: "Fellowship Member",
        ministryBadge: "Freshman Team",
      },
      body: "Amen! It was such a blessed and uplifting time together.",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      media: [],
      replyTo: {
        id: fallbackPost.id,
        authorUsername: fallbackPost.author.username,
      },
      counts: { replies: 0, reposts: 0, likes: 4, quotes: 0 },
      viewer: { liked: false, reposted: false, bookmarked: false },
    },
    {
      id: `reply-${id}-2`,
      kind: "reply",
      author: {
        id: "prayer-team-actor",
        username: "prayer",
        displayName: "Prayer Team",
        avatar: {
          urls: {
            sm: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
            md: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
            lg: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
            original: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
          },
        },
        isVerified: true,
        fellowshipRole: "Fellowship Team",
        ministryBadge: "Prayer Ministry",
      },
      authorActor: {
        id: "prayer-team-actor",
        type: "team",
        displayName: "Prayer Team",
        handle: "prayer",
        avatarUrl: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
        bio: "Intercession, morning campus prayers, fasting nights.",
        isVerified: true,
      },
      body: "Glory be to God! Standing with you all in prayer and thanksgiving.",
      createdAt: new Date(Date.now() - 900000).toISOString(),
      media: [],
      replyTo: {
        id: fallbackPost.id,
        authorUsername: fallbackPost.author.username,
      },
      counts: { replies: 0, reposts: 0, likes: 6, quotes: 0 },
      viewer: { liked: true, reposted: false, bookmarked: false },
    },
  ];

  return {
    ancestors: [],
    post: fallbackPost,
    replies: sampleReplies,
  };
}

/**
 * Create a new post or reply with actor support
 */
export async function createPost(payload: {
  body: string;
  mediaAssetIds?: string[];
  authorActorId?: string;
  parentId?: string;
  quotedId?: string;
}): Promise<Post> {
  const res = await api.post("/v1/posts", payload);
  return res.data;
}

/**
 * Toggle like reaction
 */
export async function toggleLike(
  postId: string,
  currentlyLiked: boolean
): Promise<{ liked: boolean; likeCount: number }> {
  try {
    if (currentlyLiked) {
      const res = await api.delete(`/v1/posts/${postId}/like`);
      return res.data;
    } else {
      const res = await api.put(`/v1/posts/${postId}/like`);
      return res.data;
    }
  } catch (err) {
    console.error("[toggleLike] API error:", err);
    return {
      liked: !currentlyLiked,
      likeCount: currentlyLiked ? -1 : 1,
    };
  }
}

/**
 * Toggle bookmark
 */
export async function toggleBookmark(
  postId: string,
  currentlyBookmarked: boolean
): Promise<{ bookmarked: boolean }> {
  try {
    if (currentlyBookmarked) {
      const res = await api.delete(`/v1/posts/${postId}/bookmark`);
      return res.data;
    } else {
      const res = await api.put(`/v1/posts/${postId}/bookmark`);
      return res.data;
    }
  } catch (err) {
    console.error("[toggleBookmark] API error:", err);
    return { bookmarked: !currentlyBookmarked };
  }
}

/**
 * Toggle repost
 */
export async function toggleRepost(
  postId: string,
  currentlyReposted: boolean
): Promise<{ reposted: boolean }> {
  try {
    if (currentlyReposted) {
      const res = await api.delete(`/v1/posts/${postId}/repost`);
      return res.data;
    } else {
      const res = await api.put(`/v1/posts/${postId}/repost`);
      return res.data;
    }
  } catch (err) {
    console.error("[toggleRepost] API error:", err);
    return { reposted: !currentlyReposted };
  }
}

/**
 * Delete a post (by owner or admin)
 */
export async function deletePost(postId: string): Promise<{ success: boolean }> {
  const res = await api.delete(`/v1/posts/${postId}`);
  return res.data;
}

/**
 * Fetch actors the user can post as (me, fellow, or their teams)
 */
export async function getPostableActors(): Promise<ActorSummary[]> {
  try {
    const res = await api.get("/v1/me/postable-actors");
    if (res.data?.actors && Array.isArray(res.data.actors)) {
      return res.data.actors;
    }
  } catch {
    // If unauthenticated or request fails, return default personal actor
  }

  return [
    {
      id: "me",
      type: "user",
      displayName: "Post as Myself",
      handle: "me",
      avatarUrl: null,
      bio: null,
      isVerified: false,
      isDefault: true,
    },
  ];
}

/**
 * Fetch recommended actors and ministry teams
 */
export async function getRecommendedActors(): Promise<ActorSummary[]> {
  try {
    const res = await api.get("/v1/actors");
    if (res.data?.actors && Array.isArray(res.data.actors) && res.data.actors.length > 0) {
      return res.data.actors;
    }
  } catch (err) {
    console.warn("[getRecommendedActors] Using fallback teams:", err);
  }
  return CANONICAL_FALLBACK_ACTORS;
}

/**
 * Upload an image media attachment to Cloudinary via backend
 */
export async function uploadCommunityMedia(
  file: File
): Promise<{ assetId: string; asset: MediaAssetVariant }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", "post");
  formData.append("folder", "community-posts");

  const res = await api.post("/v1/media/upload-file", formData);
  return res.data;
}
