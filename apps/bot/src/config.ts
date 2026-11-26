import dotenv from "dotenv";
dotenv.config();
export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN || "",
    API_BASE_URL: process.env.API_BASE_URL || "https://my-fellow-api.onrender.com",
    OFFICIAL_CHANNEL_URL: process.env.OFFICIAL_CHANNEL_URL || "https://t.me/AAU_4Killo_Fellowship",
    SUPPORT_CONTACTS: (process.env.SUPPORT_CONTACTS || "@AAU_4Killo_Fellowship")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    SUPPORT_PHONE: process.env.SUPPORT_PHONE || "",
    SUPPORT_TELEGRAM: process.env.SUPPORT_TELEGRAM || "",
};
if (!config.BOT_TOKEN) {
    throw new Error("BOT_TOKEN is required. Set it in .env file.");
}
