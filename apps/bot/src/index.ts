import { Bot, session } from "grammy";
import axios from "axios";
import { config } from "./config";
import { BotContext, SessionData } from "./bot/context";
import {
  handleStart,
  handleContact,
  handleNameCollected,
  handleTeamCollected,
  handleDepartmentCollected,
  handleYearCollected,
  handlePasswordCollected,
  finalizeRegistration,
  handlePasswordSubmitted,
  handleLogout,
} from "./bot/handlers/auth";
import { handleHome } from "./bot/handlers/home";
import {
  handleFellowInfo,
  handleFellowFeatures,
  handleSocialLinks,
} from "./bot/handlers/fellow-info";
import { handleEventsList, handleEventRegister } from "./bot/handlers/events";
import {
  handleDevotionsList,
  handleDevotionDetail,
} from "./bot/handlers/devotions";
import {
  handleTeamsList,
  handleTeamDetail,
  handleTeamJoin,
} from "./bot/handlers/teams";
import { handleLocationsList } from "./bot/handlers/locations";
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
import {
  handleAdminMenu,
  handleAdminStats,
  handleAdminUsersList,
  isAdminFormActive,
  handleAdminFormInput,
  handleAdminEventsList,
  handleAdminEventsMenu,
  handleAdminEventCreate,
  handleAdminEventDelete,
  handleAdminDevotionsList,
  handleAdminDevotionsMenu,
  handleAdminDevotionCreate,
  handleAdminDevotionDelete,
  handleAdminLeadersList,
  handleAdminLeadersMenu,
  handleAdminLeaderCreate,
  handleAdminLeaderDelete,
  handleAdminProgramsList,
  handleAdminProgramsMenu,
  handleAdminProgramCreate,
  handleAdminProgramDelete,
  handleAdminTeamsList,
  handleAdminTeamsMenu,
  handleAdminTeamCreate,
  handleAdminTeamDelete,
  handleAdminLocationsList,
  handleAdminLocationsMenu,
  handleAdminLocationCreate,
  handleAdminLocationDelete,
  handleAdminRegistrationsList,
  handleAdminTransactionsList,
  handleAdminOrdersList,
  handleAdminOrderStatus,
  handleAdminJoinRequestsList,
  handleAdminJoinRequestStatus,
} from "./bot/handlers/admin/index";
import { mainReplyKeyboard, fellowInfoReplyKeyboard } from "./bot/keyboards";
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
bot.hears("Back to Main Menu", async (ctx) => {
  return ctx.reply("Main Menu:", {
    reply_markup: mainReplyKeyboard(ctx.session.user?.role === "admin"),
  });
});
bot.hears("Programs", (ctx) => {
  ctx.session.currentPage = 1;
  return handleProgramsList(ctx);
});
bot.hears("Teams", (ctx) => {
  ctx.session.currentPage = 1;
  return handleTeamsList(ctx);
});
bot.hears("Locations", (ctx) => {
  ctx.session.currentPage = 1;
  return handleLocationsList(ctx);
});
bot.hears("Social Links", handleSocialLinks);
bot.hears("Events", (ctx) => {
  ctx.session.currentPage = 1;
  return handleEventsList(ctx);
});
bot.hears("Leaders", (ctx) => {
  ctx.session.currentPage = 1;
  return handleLeadersList(ctx);
});
bot.hears("Fellow Info", async (ctx) => {
  await ctx.reply("Explore Fellow Info & Resources:", {
    reply_markup: fellowInfoReplyKeyboard(),
  });
});
bot.hears("My Profile", handleMyProfile);
bot.hears("Give", handlePayments);
bot.hears("Admin", handleAdminMenu);
bot.hears("Logout", handleLogout);
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const s = ctx.session;
  try {
    if (data === "fi_menu") {
      s.currentPage = 1;
      return handleFellowFeatures(ctx);
    }
    if (data === "back_to_main") {
      s.currentPage = 1;
      return handleFellowInfo(ctx, mainReplyKeyboard());
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
    if (data === "skip_photo") return finalizeRegistration(ctx);
    if (data === "back_to_menu") {
      s.currentPage = 1;
      return handleFellowFeatures(ctx);
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
    if (data === "fi_social") {
      return handleSocialLinks(ctx);
    }
    if (data === "fi_marketplace") {
      s.currentPage = 1;
      return handleProductsList(ctx);
    }
    if (data.startsWith("ev_reg_"))
      return handleEventRegister(ctx, data.replace("ev_reg_", ""));
    if (data.startsWith("devotion_view_"))
      return handleDevotionDetail(ctx, data.replace("devotion_view_", ""));
    if (data.startsWith("team_view_")) return handleTeamDetail(ctx);
    if (data.startsWith("team_join_"))
      return handleTeamJoin(ctx, data.replace("team_join_", ""));

    if (data.startsWith("program_view_"))
      return handleProgramDetail(ctx, data.replace("program_view_", ""));
    if (data.startsWith("product_view_"))
      return handleProductDetail(ctx, data.replace("product_view_", ""));
    if (data === "profile_join_requests") return handleJoinRequests(ctx);
    if (data === "profile_orders") return handleMyOrders(ctx);
    if (data === "profile_givings") return handleMyGivings(ctx);
    if (data === "pay_donate") return handleDonateStart(ctx);
    if (data === "pay_menu") {
      delete (ctx.session as any).__pendingPayment;
      return handlePayments(ctx);
    }
    if (data === "pay_history") return handleMyGivings(ctx);
    if (data.startsWith("reg_team_")) {
      await ctx.answerCallbackQuery();
      return handleTeamCollected(ctx, data.replace("reg_team_", ""));
    }
    if (data.startsWith("reg_dept_")) {
      await ctx.answerCallbackQuery();
      return handleDepartmentCollected(ctx, data.replace("reg_dept_", ""));
    }
    if (data.startsWith("reg_year_")) {
      await ctx.answerCallbackQuery();
      return handleYearCollected(ctx, data.replace("reg_year_", ""));
    }

    if (data === "adm_menu") return handleAdminMenu(ctx);
    if (data === "adm_stats") return handleAdminStats(ctx);
    if (data === "adm_users") {
      s.currentPage = 1;
      return handleAdminUsersList(ctx);
    }
    if (data === "adm_events") return handleAdminEventsMenu(ctx);
    if (data === "adm_events_list") return handleAdminEventsList(ctx);
    if (data === "adm_events_add") return handleAdminEventCreate(ctx);
    if (data === "adm_devotions") return handleAdminDevotionsMenu(ctx);
    if (data === "adm_devotions_list") {
      s.currentPage = 1;
      return handleAdminDevotionsList(ctx);
    }
    if (data === "adm_devotions_add") return handleAdminDevotionCreate(ctx);
    if (data === "adm_leaders") return handleAdminLeadersMenu(ctx);
    if (data === "adm_leaders_list") return handleAdminLeadersList(ctx);
    if (data === "adm_leaders_add") return handleAdminLeaderCreate(ctx);
    if (data === "adm_programs") return handleAdminProgramsMenu(ctx);
    if (data === "adm_programs_list") return handleAdminProgramsList(ctx);
    if (data === "adm_programs_add") return handleAdminProgramCreate(ctx);
    if (data === "adm_teams") return handleAdminTeamsMenu(ctx);
    if (data === "adm_teams_list") return handleAdminTeamsList(ctx);
    if (data === "adm_teams_add") return handleAdminTeamCreate(ctx);
    if (data === "adm_locations") return handleAdminLocationsMenu(ctx);
    if (data === "adm_locations_list") return handleAdminLocationsList(ctx);
    if (data === "adm_locations_add") return handleAdminLocationCreate(ctx);
    if (data === "adm_registrations") {
      s.currentPage = 1;
      return handleAdminRegistrationsList(ctx);
    }
    if (data === "adm_transactions") {
      s.currentPage = 1;
      return handleAdminTransactionsList(ctx);
    }
    if (data === "adm_orders") return handleAdminOrdersList(ctx);
    if (data === "adm_joinreqs") return handleAdminJoinRequestsList(ctx);

    if (data.includes("_page_")) {
      const parts = data.split("_");
      if (parts[0] === "adm") {
        const entity = parts[1];
        const page = parseInt(parts[3]);
        s.currentPage = page;
        if (entity === "users") return handleAdminUsersList(ctx);
        if (entity === "registrations")
          return handleAdminRegistrationsList(ctx);
        if (entity === "transactions") return handleAdminTransactionsList(ctx);
      } else {
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
    }

    await ctx.answerCallbackQuery();
  } catch (err: any) {
    console.error("Callback handler error:", err.message);
    await ctx.answerCallbackQuery("Error processing request.").catch(() => {});
  }
});
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  const s = ctx.session;

  if (text.startsWith("/adm_") && s.user?.role === "admin" && s.token) {
    const parts = text.substring(1).split("_");
    if (parts.length >= 4 && parts[2] === "del") {
      const entity = parts[1];
      const id = parts.slice(3).join("_");
      if (entity === "events") return handleAdminEventDelete(ctx, id);
      if (entity === "devotions") return handleAdminDevotionDelete(ctx, id);
      if (entity === "leaders") return handleAdminLeaderDelete(ctx, id);
      if (entity === "programs") return handleAdminProgramDelete(ctx, id);
      if (entity === "teams") return handleAdminTeamDelete(ctx, id);
      if (entity === "locations") return handleAdminLocationDelete(ctx, id);
    }
    if (parts.length >= 4 && parts[2] === "approve") {
      const entity = parts[1];
      const id = parts.slice(3).join("_");
      if (entity === "orders")
        return handleAdminOrderStatus(ctx, id, "approved");
      if (entity === "joinreqs")
        return handleAdminJoinRequestStatus(ctx, id, "approved");
    }
    if (parts.length >= 4 && parts[2] === "reject") {
      const entity = parts[1];
      const id = parts.slice(3).join("_");
      if (entity === "orders")
        return handleAdminOrderStatus(ctx, id, "rejected");
      if (entity === "joinreqs")
        return handleAdminJoinRequestStatus(ctx, id, "rejected");
    }
    return;
  }

  if (s.state === "COLLECT_NAME") {
    return handleNameCollected(ctx, text);
  }
  if (s.state === "COLLECT_TEAM") {
    return handleTeamCollected(ctx, text);
  }
  if (s.state === "COLLECT_DEPARTMENT") {
    return handleDepartmentCollected(ctx, text);
  }
  if (s.state === "COLLECT_YEAR") {
    return handleYearCollected(ctx, text);
  }
  if (s.state === "COLLECT_PASSWORD") {
    return handlePasswordCollected(ctx, text);
  }
  const p = s as any;
  if (p.__pendingPassword) {
    return handlePasswordSubmitted(ctx, text);
  }
  if (p.__pendingPayment) {
    return completePayment(ctx, text);
  }
  if (isAdminFormActive(ctx)) {
    const handled = await handleAdminFormInput(ctx, text);
    if (handled) return;
  }
  const validButtons = [
    "Events",
    "Leaders",
    "Fellow Info",
    "Give",
    "Programs",
    "Teams",
    "Locations",
    "Social Links",
    "Back to Main Menu",
    "Admin",
  ];
  if (!validButtons.includes(text)) {
    await ctx.reply("Please use the menu buttons at the bottom to continue.");
  }
});
bot.on("message:photo", async (ctx) => {
  const s = ctx.session as any;
  if (s.__awaitingPhoto) {
    const photo = ctx.message.photo;
    const bestPhoto = photo[photo.length - 1];
    const file = await ctx.api.getFile(bestPhoto.file_id);
    if (file.file_path) {
      const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`;
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data);
      return finalizeRegistration(ctx, buffer);
    }
  }
  await ctx.reply("Please use the menu buttons at the bottom to continue.");
});
bot.catch((err) => {
  console.error(`Bot error for update ${err.ctx.update.update_id}:`, err.error);
});
console.log("My Fellow Bot is updated. Starting in hybrid mode...");
bot.api.deleteWebhook({ drop_pending_updates: true }).then(() => {
  bot.start();
});
