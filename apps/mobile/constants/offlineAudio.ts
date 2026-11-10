import { Devotion } from "@/types/devotion.types";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Bundled offline audio assets for guaranteed zero-network playback.
 */
export const BUNDLED_OFFLINE_AUDIO: Record<string, any> = {
  "devotion-1": require("@/assets/audio/devotions/devotion-1.m4a"),
  "devotion-3": require("@/assets/audio/devotions/devotion-3.m4a"),
  "devotion-5": require("@/assets/audio/devotions/devotion-5.m4a"),
  "devotion-7": require("@/assets/audio/devotions/devotion-7.m4a"),
};

export const TITLE_TO_OFFLINE_AUDIO: Record<string, any> = {
  "እርሱ በመጣ ቀን": require("@/assets/audio/devotions/devotion-1.m4a"),
  "እርሱ በመጣ ቀን — በማርታና በማርያም ቤት": require("@/assets/audio/devotions/devotion-1.m4a"),
  "በእርሱ ጊዜ": require("@/assets/audio/devotions/devotion-3.m4a"),
  "በእርሱ ጊዜ — የሕይወት ሩጫና ትዕግሥት": require("@/assets/audio/devotions/devotion-3.m4a"),
  "ውሎህ እንዴት ነው?": require("@/assets/audio/devotions/devotion-5.m4a"),
  "ውሎህ እንዴት ነው? — ዕለታዊ ልማድና መንፈሳዊ ማንነት": require("@/assets/audio/devotions/devotion-5.m4a"),
  "የመሆን ንድፍ": require("@/assets/audio/devotions/devotion-7.m4a"),
};

/**
 * Synchronous lookup for bundled offline audio.
 * Returns asset number if found, or null otherwise.
 */
export function getBundledOfflineAudio(id?: string, title?: string): any | null {
  if (id && BUNDLED_OFFLINE_AUDIO[id]) {
    return BUNDLED_OFFLINE_AUDIO[id];
  }
  if (title) {
    const cleanTitle = title.trim();
    if (TITLE_TO_OFFLINE_AUDIO[cleanTitle]) {
      return TITLE_TO_OFFLINE_AUDIO[cleanTitle];
    }
    // Partial title match fallback
    for (const [key, asset] of Object.entries(TITLE_TO_OFFLINE_AUDIO)) {
      if (cleanTitle.includes(key) || key.includes(cleanTitle)) {
        return asset;
      }
    }
  }
  return null;
}

/**
 * Resolves the best available audio source for a devotion:
 * 1. Previously downloaded local audio file in FileSystem.documentDirectory
 * 2. Bundled local audio asset
 * 3. Remote audio URL fallback
 */
export async function resolveDevotionAudioSource(
  devotion?: Devotion | null,
): Promise<any | null> {
  if (!devotion || devotion.type !== "voice") return null;

  // 1. Check local downloaded filesystem
  if (devotion._id) {
    const candidates = [
      `${FileSystem.documentDirectory}devotions/${devotion._id}/audio.mp3`,
      `${FileSystem.documentDirectory}devotions/${devotion._id}/audio.m4a`,
    ];
    for (const candidate of candidates) {
      try {
        const info = await FileSystem.getInfoAsync(candidate);
        if (info.exists) {
          return candidate;
        }
      } catch {}
    }
  }

  // 2. Check bundled asset
  const bundled = getBundledOfflineAudio(devotion._id, devotion.title);
  if (bundled) {
    return bundled;
  }

  // 3. Remote URL fallback
  if (devotion.audioUrl) {
    return devotion.audioUrl;
  }

  return null;
}
