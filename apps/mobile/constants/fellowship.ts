/**
 * Centralized fellowship metadata & contact links for the mobile client.
 * Override any value via EXPO_PUBLIC_* environment variables in EAS / .env.
 */
export const FELLOWSHIP_CONFIG = {
  appName: "My Fellow",
  organizationName: "4 Kilo Christian Students Fellowship",
  shortName: "4 Kilo Fellowship",
  campus: "AAU Arat Kilo Campus",
  hotlinePhone: process.env.EXPO_PUBLIC_SUPPORT_PHONE || "",
  telegramUrl:
    process.env.EXPO_PUBLIC_TELEGRAM_URL || "https://t.me/I4U_TEAM_bot",
  telegramLabel:
    process.env.EXPO_PUBLIC_TELEGRAM_LABEL || "4 Kilo Fellowship Telegram",
} as const;
