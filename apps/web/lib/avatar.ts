/**
 * Avatar generation utilities for My Fellow Web.
 * Uses DiceBear 9.x matching mobile app parity.
 */

export const AVATAR_PRESETS = [
  { id: "adventurer-1", name: "Adventurer", url: "https://api.dicebear.com/9.x/adventurer/png?seed=fellowship1&backgroundColor=ffedd5&radius=50" },
  { id: "lorelei-1", name: "Lorelei", url: "https://api.dicebear.com/9.x/lorelei/png?seed=fellowship2&backgroundColor=d1fae5&radius=50" },
  { id: "personas-1", name: "Personas", url: "https://api.dicebear.com/9.x/personas/png?seed=fellowship3&backgroundColor=b6e3f4&radius=50" },
  { id: "bottts-1", name: "Tech Bot", url: "https://api.dicebear.com/9.x/bottts-neutral/png?seed=fellowship4&backgroundColor=ffd5dc&radius=50" },
  { id: "notionists-1", name: "Scholar", url: "https://api.dicebear.com/9.x/notionists/png?seed=fellowship5&backgroundColor=fed7aa&radius=50" },
  { id: "adventurer-2", name: "Leader", url: "https://api.dicebear.com/9.x/adventurer/png?seed=fellowship6&backgroundColor=c0aede&radius=50" },
];

export function getPrefilledAvatar(seedKey?: string | null): string {
  const cleanKey = seedKey ? seedKey.trim().replace(/[^a-zA-Z0-9]/g, "") : "";
  const seed = cleanKey.length > 0 ? cleanKey : "fellowship";
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=ffedd5&radius=50`;
}
