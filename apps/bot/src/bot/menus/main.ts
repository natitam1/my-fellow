import { InlineKeyboard } from "grammy";
import { BotContext } from "../context";

/**
 * Sends the main menu with all available options as inline keyboard buttons.
 */
export async function sendMainMenu(ctx: BotContext) {
  const isLoggedIn = !!ctx.session.token;

  const text =
    "🏠 *Main Menu*\n\n" + "Welcome to My Fellow Bot! Choose an option below:";

  const kb = new InlineKeyboard()
    .text("📅 Events", "view_events")
    .text("📖 Devotions", "view_devotions")
    .row()
    .text("👥 Teams", "view_teams")
    .text("📆 Programs", "view_programs")
    .row()
    .text("📍 Locations", "view_locations")
    .text("👤 Leaders", "view_leaders")
    .row();

  if (isLoggedIn) {
    kb.text("💸 Contribute", "start_payment").row();
  }

  kb.text("ℹ️ About", "about").text("⚙️ Settings", "settings");

  await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
}
