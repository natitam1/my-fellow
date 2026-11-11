export type PostKind = "post" | "reply" | "repost" | "quote";

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatar: {
    id?: string;
    kind?: string;
    width?: number;
    height?: number;
    urls: {
      sm: string;
      md: string;
      lg: string;
      original: string;
    };
  } | null;
  isVerified: boolean;
  fellowshipRole?: string | null;
  ministryBadge?: string | null;
}

export interface ActorSummary {
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
  followerCount?: number;
  postsCount?: number;
  postCount?: number;
  isFollowing?: boolean;
  following?: boolean;
}

export interface MediaAssetVariant {
  id: string;
  kind: string;
  width: number;
  height: number;
  urls: {
    sm: string;
    md: string;
    lg: string;
    original: string;
  };
  altText?: string | null;
}

export interface PostCounts {
  replies: number;
  reposts: number;
  likes: number;
  quotes: number;
}

export interface ViewerInteractions {
  liked: boolean;
  reposted: boolean;
  bookmarked: boolean;
}

export interface Post {
  id: string;
  kind: PostKind;
  author: UserSummary;
  authorActor?: ActorSummary | null;
  createdByUserId?: string | null;
  body: string | null;
  createdAt: string;
  editedAt?: string | null;
  media: MediaAssetVariant[];
  replyTo?: {
    id: string;
    authorUsername: string;
  };
  repostOf?: Post | null;
  quoted?: Post | null;
  counts: PostCounts;
  viewer: ViewerInteractions;
  tombstone?: string;
}

export interface FeedResponse {
  items: Post[];
  nextCursor?: { t: string; id: string } | null;
  hasMore?: boolean;
}

export interface ThreadResponse {
  ancestors: Post[];
  post: Post;
  replies: Post[];
}

export type FeedTab = "all" | "following" | "announcements" | "prayer_requests";
