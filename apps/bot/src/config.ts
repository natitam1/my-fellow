import dotenv from "dotenv";
dotenv.config();

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  API_BASE_URL:
    process.env.API_BASE_URL || "https://my-fellow-api.onrender.com",
};

if (!config.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is required. Set it in .env file.");
}
