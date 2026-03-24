import { Bot, session } from "grammy";
import { config } from "./config";
import { BotContext, SessionData } from "./bot/context";
import {
  handleStart,
  handleContact,
  handleNameCollected,
  handlePasswordSubmitted,
  handleLogout,
} from "./bot/handlers/auth";
import { handleHome } from "./bot/handlers/home";
import {
  handleFellowInfo,
  handleFellowFeatures,
} from "./bot/handlers/fellow-info";
import { handleEventsList, handleEventRegister } from "./bot/handlers/events";
import {
  handleDevotionsList,
  handleDevotionDetail,
} from "./bot/handlers/devotions";
import { handleTeamsList, handleTeamDetail } from "./bot/handlers/teams";
import {
  handleLocationsList,
  handleLocationDetail,
} from "./bot/handlers/locations";
import {
  handleProgramsList,
  handleProgramDetail,
} from "./bot/handlers/programs";
import { handleLeadersList } from "./bot/handlers/leaders";
import {
  handleProductsList,
  handleProductDetail,
} from "./bot/handlers/marketplace";
import {
  handleMyProfile,
  handleJoinRequests,
  handleMyOrders,
  handleMyGivings,
} from "./bot/handlers/profile";
import {
  handlePayments,
  handleDonateStart,
  completePayment,
} from "./bot/handlers/payments";
import { handleHelp } from "./bot/handlers/help";
import { deleteLastBotMessage } from "./bot/message-manager";

const bot = new Bot<BotContext>(config.BOT_TOKEN);

bot.use(
  session({
    initial: (): SessionData => ({
      state: "IDLE",
      currentPage: 1,
    }),
  }),
);

bot.command("start", handleStart);
bot.command("menu", (ctx) => {
  ctx.session.currentPage = 1;
  return handleEventsList(ctx);
});
bot.command("logout", handleLogout);

bot.on("message:contact", handleContact);

bot.hears("Events", (ctx) => {
  ctx.session.currentPage = 1;
  return handleEventsList(ctx);
});
bot.hears("Fellow Info", handleFellowInfo);
bot.hears("My Profile", handleMyProfile);
bot.hears("Payments", handlePayments);
bot.hears("Logout", handleLogout);
bot.hears("Help", handleHelp);

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const s = ctx.session;

  try {
    if (data === "fi_menu") {
      s.currentPage = 1;
      return handleFellowInfo(ctx);
    }
    if (data === "fi_features") {
      return handleFellowFeatures(ctx);
    }
    if (data === "fi_channel") {
      await ctx.answerCallbackQuery({
        url: "https://t.me/AAU_4Killo_Fellowship",
      });
      return;
    }
    if (data === "profile_menu") return handleMyProfile(ctx);
    if (data === "back_to_menu") {
      s.currentPage = 1;
      return handleEventsList(ctx);
    }

    if (data === "fi_events") {
      s.currentPage = 1;
      return handleEventsList(ctx);
    }
    if (data === "fi_teams") {
      s.currentPage = 1;
      return handleTeamsList(ctx);
    }
    if (data === "fi_locations") {
      s.currentPage = 1;
      return handleLocationsList(ctx);
    }
    if (data === "fi_programs") {
      s.currentPage = 1;
      return handleProgramsList(ctx);
    }
    if (data === "fi_leaders") {
      s.currentPage = 1;
      return handleLeadersList(ctx);
    }
    if (data === "fi_marketplace") {
      s.currentPage = 1;
      return handleProductsList(ctx);
    }

    if (data.includes("_page_")) {
      const parts = data.split("_");
      const section = parts[0];
      const page = parseInt(parts[2]);
      s.currentPage = page;
      if (section === "events") return handleEventsList(ctx);
      if (section === "devotions") return handleDevotionsList(ctx);
      if (section === "teams") return handleTeamsList(ctx);
      if (section === "locations") return handleLocationsList(ctx);
      if (section === "programs") return handleProgramsList(ctx);
      if (section === "leaders") return handleLeadersList(ctx);
      if (section === "marketplace") return handleProductsList(ctx);
    }

    if (data.startsWith("ev_reg_"))
      return handleEventRegister(ctx, data.replace("ev_reg_", ""));
    if (data.startsWith("devotion_view_"))
      return handleDevotionDetail(ctx, data.replace("devotion_view_", ""));
    if (data.startsWith("team_view_"))
      return handleTeamDetail(ctx, data.replace("team_view_", ""));
    if (data.startsWith("location_view_"))
      return handleLocationDetail(ctx, data.replace("location_view_", ""));
    if (data.startsWith("program_view_"))
      return handleProgramDetail(ctx, data.replace("program_view_", ""));
    if (data.startsWith("product_view_"))
      return handleProductDetail(ctx, data.replace("product_view_", ""));

    if (data === "profile_join_requests") return handleJoinRequests(ctx);
    if (data === "profile_orders") return handleMyOrders(ctx);
    if (data === "profile_givings") return handleMyGivings(ctx);
    if (data === "pay_donate") return handleDonateStart(ctx);
    if (data === "pay_history") return handleMyGivings(ctx);

    await ctx.answerCallbackQuery();
  } catch (err: any) {
    console.error("Callback handler error:", err.message);
    await ctx.answerCallbackQuery("Error processing request.").catch(() => {});
  }
});

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  const s = ctx.session;

  if (s.state === "COLLECT_NAME") {
    return handleNameCollected(ctx, text);
  }

  const p = s as any;
  if (p.__pendingPassword) {
    return handlePasswordSubmitted(ctx, text);
  }
  if (p.__pendingPayment) {
    return completePayment(ctx, text);
  }

  const validButtons = [
    "Events",
    "Fellow Info",
    "My Profile",
    "Payments",
    "Help",
    "Logout",
  ];
  if (!validButtons.includes(text)) {
    await ctx.reply("Please use the menu buttons at the bottom to continue.");
  }
});

bot.catch((err) => {
  console.error(`Bot error for update ${err.ctx.update.update_id}:`, err.error);
});

console.log("My Fellow Bot is updated. Starting in hybrid mode...");
bot.start();
