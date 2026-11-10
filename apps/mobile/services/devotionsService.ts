import {
  Devotion,
  DevotionResponse,
  DevotionType,
  SingleDevotionResponse,
} from "@/types/devotion.types";
import { OFFLINE_DEVOTIONS } from "@/constants/offlineDevotions";
import { cache } from "@/utils/cache";
import api from "./api";

export interface DevotionInputPayload {
  title?: string;
  author?: string;
  authorActorId?: string;
  actorType?: "official" | "team" | "user";
  authorHandle?: string;
  authorAvatar?: string;
  authorRole?: string;
  authorUsername?: string;
  date?: string;
  type?: DevotionType | string;
  tags?: string[] | string;
  featured?: boolean;
  image?: any;
  content?: string;
  duration?: string;
  caption?: string;
  audioUrl?: string;
  [key: string]: any;
}

const CACHE_KEYS = {
  DEVOTIONS_LIST: (params?: any) =>
    `devotions_list_${JSON.stringify(params || {})}`,
  DEVOTION_DETAIL: (id: string) => `devotion_detail_${id}`,
};

export const devotionsService = {
  getDevotions: async (params?: {
    type?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<DevotionResponse> => {
    const key = CACHE_KEYS.DEVOTIONS_LIST(params);
    try {
      const response = await api.get<DevotionResponse>("/devotions", {
        params,
        timeout: 4000,
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        await cache.set(key, response.data);
        // Pre-cache individual devotions into storage
        Promise.all(
          response.data.data.map((item) =>
            cache.set(CACHE_KEYS.DEVOTION_DETAIL(item._id), {
              success: true,
              data: item,
            }),
          ),
        ).catch(() => {});
      }
      return response.data;
    } catch (error) {
      console.log("Network error fetching devotions, falling back to cache/offline data");
      const cached = await cache.get<DevotionResponse>(key);
      if (cached && cached.data && cached.data.length > 0) {
        return cached;
      }
      // Return offline bundled devotions as reliable offline fallback
      return {
        success: true,
        data: OFFLINE_DEVOTIONS,
      };
    }
  },

  getDevotionById: async (id: string): Promise<SingleDevotionResponse> => {
    const key = CACHE_KEYS.DEVOTION_DETAIL(id);
    try {
      const response = await api.get<SingleDevotionResponse>(
        `/devotions/${id}`,
        { timeout: 4000 },
      );
      if (response.data?.success && response.data.data) {
        await cache.set(key, response.data);
      }
      return response.data;
    } catch (error) {
      console.log(`Network error fetching devotion ${id}, checking cache/offline data`);
      const cached = await cache.get<SingleDevotionResponse>(key);
      if (cached && cached.data) return cached;

      const offlineMatch = OFFLINE_DEVOTIONS.find(
        (d) => d._id === id || d.title === id,
      );
      if (offlineMatch) {
        return {
          success: true,
          data: offlineMatch,
        };
      }

      return {
        success: false,
        message: "Devotion not found offline",
        data: null as any,
      };
    }
  },

  likeDevotion: async (id: string, action: "like" | "unlike" = "like") => {
    try {
      const response = await api.post<{
        success: boolean;
        data: { likes: number; likesFormatted: string };
      }>(`/devotions/${id}/like`, { action });
      return response.data;
    } catch {
      return {
        success: true,
        data: { likes: 0, likesFormatted: "0" },
      };
    }
  },

  trackView: async (id: string) => {
    try {
      const response = await api.post<{
        success: boolean;
        data: { views: number; viewsFormatted: string };
      }>(`/devotions/${id}/view`);
      return response.data;
    } catch {
      return {
        success: true,
        data: { views: 0, viewsFormatted: "0" },
      };
    }
  },

  createDevotion: async (
    data: FormData | DevotionInputPayload | any,
  ): Promise<Devotion> => {
    const isFormData = data instanceof FormData;
    const res = await api.post<SingleDevotionResponse>("/devotions", data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });
    return res.data.data;
  },

  updateDevotion: async (
    id: string,
    data: FormData | DevotionInputPayload | any,
  ): Promise<Devotion> => {
    const isFormData = data instanceof FormData;
    const res = await api.put<SingleDevotionResponse>(`/devotions/${id}`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });
    return res.data.data;
  },

  deleteDevotion: async (id: string): Promise<boolean> => {
    const res = await api.delete(`/devotions/${id}`);
    return res.data?.success !== false;
  },
};
