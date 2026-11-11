export type DevotionType = "text" | "voice";
export type DevotionActorType = "official" | "team" | "user";

export interface Devotion {
  _id: string;
  id?: string;
  title: string;
  author: string;
  authorId?: string;
  authorActorId?: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorRole?: string;
  authorUsername?: string;
  actorType?: DevotionActorType;
  date: string;
  views: number;
  likes: number;
  image: string;
  type: DevotionType;
  duration?: string;
  content?: string;
  caption?: string;
  audioUrl?: string;
  tags?: string[];
  featured?: boolean;
  scriptureReference?: string;
  scriptureText?: string;
  prayer?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  likesFormatted?: string;
  viewsFormatted?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DevotionComment {
  _id: string;
  id?: string;
  devotionId: string;
  authorId?: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
}

export interface DevotionsResponse {
  success: boolean;
  data: Devotion[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  message?: string;
}

export interface SingleDevotionResponse {
  success: boolean;
  data: Devotion;
  message?: string;
}

export interface WriterRequestData {
  reason: string;
  sampleDevotionTitle: string;
  sampleDevotionContent: string;
  preferredLanguage?: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  totalCheckIns?: number;
}
