import { Bot } from "grammy";
import "dotenv/config";

// 1. Create a bot object
const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN is not set in environment variables!");
}

const bot = new Bot(token);

// Global error handler
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  console.error(err.error);
});

// 2. Register some handlers
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.on("message", (ctx) => ctx.reply("Got your message!"));

// 3. Start the bot
console.log("Bot is starting...");
bot.start();
