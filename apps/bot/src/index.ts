import { Bot, session } from "grammy";
import { config } from "./config";
import { BotContext, SessionData } from "./bot/context";
import { sendMainMenu } from "./bot/menus/main";
import {
  handleViewEvents,
  handleEventDetail,
  handleEventRegistration,
  completeEventRegistration,
} from "./bot/handlers/events";
import {
  handleViewDevotions,
  handleDevotionDetail,
  handleLikeDevotion,
} from "./bot/handlers/devotions";
import {
  handleViewTeams,
  handleTeamDetail,
  handleJoinTeam,
  completeJoinRequest,
} from "./bot/handlers/teams";
import { handleStartPayment, completePayment } from "./bot/handlers/payments";
import {
  handleViewLocations,
  handleLocationDetail,
} from "./bot/handlers/locations";
import {
  handleViewPrograms,
  handleProgramDetail,
} from "./bot/handlers/programs";
import { handleViewLeaders, handleLeaderDetail } from "./bot/handlers/leaders";
const bot = new Bot<BotContext>(config.BOT_TOKEN);
bot.use(
  session({
    initial: (): SessionData => ({}),
  }),
);
bot.command("start", async (ctx) => {
  ctx.session = {} as SessionData;
  await ctx.reply(
    "\uD83D\uDC4B *Welcome to My Fellow Bot!*\n\n" +
      "Your gateway to events, devotions, teams, and more.\n\n" +
      "Use the menu below to get started, or type /menu at any time.",
    { parse_mode: "Markdown" },
  );
  await sendMainMenu(ctx);
});
bot.command("menu", async (ctx) => {
  await sendMainMenu(ctx);
});
bot.command("help", async (ctx) => {
  await ctx.reply(
    "\u2139\uFE0F *My Fellow Bot Help*\n\n" +
      "Available commands:\n" +
      "/start \u2014 Start the bot\n" +
      "/menu \u2014 Show main menu\n" +
      "/login \u2014 Log in to your account\n" +
      "/help \u2014 Show this help message\n\n" +
      "You can also use the inline buttons to navigate.",
    { parse_mode: "Markdown" },
  );
});
bot.command("login", async (ctx) => {
  await ctx.reply(
    "\uD83D\uDD12 *Login*\n\nPlease send your phone number and password separated by a space.\n\n" +
      "Example: `0912345678 MyPass1`\n\n" +
      "\u26A0\uFE0F Password must be at least 6 characters.",
    { parse_mode: "Markdown" },
  );
  (ctx.session as any).__pendingLogin = true;
});
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  try {
    if (data === "back_to_menu") {
      await ctx.answerCallbackQuery();
      await sendMainMenu(ctx);
      return;
    }
    if (data === "view_events") {
      await ctx.answerCallbackQuery();
      await handleViewEvents(ctx);
      return;
    }
    if (data.startsWith("event_")) {
      await ctx.answerCallbackQuery();
      const eventId = data.replace("event_", "");
      await handleEventDetail(ctx, eventId);
      return;
    }
    if (data.startsWith("register_event_")) {
      await ctx.answerCallbackQuery();
      const parts = data.replace("register_event_", "").split("_");
      const title = parts.slice(1).join("_");
      await handleEventRegistration(ctx, title);
      return;
    }
    if (data === "view_devotions") {
      await ctx.answerCallbackQuery();
      await handleViewDevotions(ctx);
      return;
    }
    if (data.startsWith("devfilter_")) {
      await ctx.answerCallbackQuery();
      const type = data.replace("devfilter_", "") as any;
      await handleViewDevotions(ctx, type);
      return;
    }
    if (data.startsWith("devotion_")) {
      await ctx.answerCallbackQuery();
      const devotionId = data.replace("devotion_", "");
      await handleDevotionDetail(ctx, devotionId);
      return;
    }
    if (data.startsWith("like_dev_")) {
      const devotionId = data.replace("like_dev_", "");
      await handleLikeDevotion(ctx, devotionId);
      return;
    }
    if (data.startsWith("listen_dev_")) {
      await ctx.answerCallbackQuery();
      const parts = data.replace("listen_dev_", "").split("_");
      const mediaUrl = parts.slice(1).join("_");
      await ctx.replyWithAudio(mediaUrl);
      return;
    }
    if (data.startsWith("download_dev_")) {
      await ctx.answerCallbackQuery();
      const parts = data.replace("download_dev_", "").split("_");
      const mediaUrl = parts.slice(1).join("_");
      await ctx.replyWithDocument(mediaUrl);
      return;
    }
    if (data === "view_teams") {
      await ctx.answerCallbackQuery();
      await handleViewTeams(ctx);
      return;
    }
    if (data.startsWith("team_")) {
      await ctx.answerCallbackQuery();
      const teamId = data.replace("team_", "");
      await handleTeamDetail(ctx, teamId);
      return;
    }
    if (data.startsWith("join_team_")) {
      await ctx.answerCallbackQuery();
      const teamId = data.replace("join_team_", "");
      await handleJoinTeam(ctx, teamId);
      return;
    }
    if (data === "start_payment") {
      await ctx.answerCallbackQuery();
      await handleStartPayment(ctx);
      return;
    }
    if (data === "view_locations") {
      await ctx.answerCallbackQuery();
      await handleViewLocations(ctx);
      return;
    }
    if (data.startsWith("location_")) {
      await ctx.answerCallbackQuery();
      const locationId = data.replace("location_", "");
      await handleLocationDetail(ctx, locationId);
      return;
    }
    if (data === "view_programs") {
      await ctx.answerCallbackQuery();
      await handleViewPrograms(ctx);
      return;
    }
    if (data.startsWith("program_")) {
      await ctx.answerCallbackQuery();
      const programId = data.replace("program_", "");
      await handleProgramDetail(ctx, programId);
      return;
    }
    if (data === "view_leaders") {
      await ctx.answerCallbackQuery();
      await handleViewLeaders(ctx);
      return;
    }
    if (data.startsWith("leader_")) {
      await ctx.answerCallbackQuery();
      const leaderId = data.replace("leader_", "");
      await handleLeaderDetail(ctx, leaderId);
      return;
    }
    if (data === "about") {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        "\u2139\uFE0F *About My Fellow*\n\n" +
          "My Fellow is your community companion \u2014 connecting you to events, devotions, " +
          "teams, programs, and more.\n\n" +
          "Built with \u2764\uFE0F for the fellowship.",
        { parse_mode: "Markdown" },
      );
      return;
    }
    if (data === "settings") {
      await ctx.answerCallbackQuery();
      const logStatus = ctx.session.token
        ? "\u2705 Logged in"
        : "\u274C Not logged in";
      await ctx.reply(
        `⚙️ *Settings*\n\nLogin status: ${logStatus}\n\nUse /login to log in or /start to restart.`,
        { parse_mode: "Markdown" },
      );
      return;
    }
    await ctx.answerCallbackQuery("Unknown action");
  } catch (err: any) {
    console.error("Callback error:", err.message);
    await ctx.answerCallbackQuery("An error occurred").catch(() => {});
  }
});
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  const s = ctx.session as any;
  if (s.__pendingLogin) {
    const parts = text.split(" ");
    if (parts.length < 2) {
      await ctx.reply(
        "\u26A0\uFE0F Please send: `phone password` (separated by a space)",
        {
          parse_mode: "Markdown",
        },
      );
      return;
    }
    const [phone, password] = parts;
    if (password.length < 6) {
      await ctx.reply("\u26A0\uFE0F Password must be at least 6 characters.");
      return;
    }
    try {
      const { publicApi } = await import("./api/client");
      const { data } = await publicApi.post("/api/auth/login", {
        phoneNumber: phone,
        password,
      });
      ctx.session.token = data.token || data.accessToken;
      ctx.session.user = {
        _id: data.user?._id || data._id || "",
        fullName: data.user?.fullName || data.fullName || "",
        phoneNumber: phone,
        role: data.user?.role || data.role || "user",
      };
      delete s.__pendingLogin;
      await ctx.reply("\u2705 *Logged in successfully!*", {
        parse_mode: "Markdown",
      });
      await sendMainMenu(ctx);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      await ctx.reply(`❌ Login failed: ${msg}`);
    }
    return;
  }
  if (s.__pendingEventReg) {
    const consumed = await completeEventRegistration(ctx, text);
    if (consumed) return;
  }
  if (s.__pendingJoinReq) {
    const consumed = await completeJoinRequest(ctx, text);
    if (consumed) return;
  }
  if (s.__pendingPayment) {
    const consumed = await completePayment(ctx, text);
    if (consumed) return;
  }
  await ctx.reply("I didn't understand that. Use /menu to see your options.");
});
bot.catch((err) => {
  console.error(`Bot error for update ${err.ctx.update.update_id}:`, err.error);
});
console.log("\uD83D\uDE80 My Fellow Bot is starting...");
bot.start();
