import { BotContext } from "../context";
import { getAllLeaders, getLeaderById } from "../../api/leaders";
import { InlineKeyboard } from "grammy";
export async function handleViewLeaders(ctx: BotContext) {
  try {
    const result = await getAllLeaders();
    const leaders = Array.isArray(result)
      ? result
      : result.leaders || result.data || [];
    if (!leaders.length) {
      await ctx.reply("\uD83D\uDC64 No leaders listed.");
      return;
    }
    const kb = new InlineKeyboard();
    for (const l of leaders.slice(0, 15)) {
      kb.text(`👤 ${l.name}`, `leader_${l._id}`).row();
    }
    kb.text("\uD83D\uDD19 Back to Menu", "back_to_menu");
    await ctx.reply(
      "\uD83D\uDC64 *Our Leaders*\n\nSelect a leader to learn more:",
      {
        parse_mode: "Markdown",
        reply_markup: kb,
      },
    );
  } catch {
    await ctx.reply("\u274C Failed to load leaders.");
  }
}
export async function handleLeaderDetail(ctx: BotContext, leaderId: string) {
  try {
    const result = await getLeaderById(leaderId);
    const l = result.leader || result;
    let text = `👤 *${l.name}*\n\n`;
    if (l.role) text += `💼 Role: ${l.role}\n`;
    if (l.bio) text += `📝 ${l.bio}\n\n`;
    if (l.phoneNumber) text += `📱 Phone: ${l.phoneNumber}\n`;
    if (l.telegram) text += `✈️ Telegram: ${l.telegram}\n`;
    if (l.type) text += `🏷 Type: ${l.type}\n`;
    const kb = new InlineKeyboard();
    if (l.telegram) {
      kb.url(
        "\uD83D\uDCAC Message on Telegram",
        `https://t.me/${l.telegram.replace("@", "")}`,
      ).row();
    }
    kb.text("\uD83D\uDD19 Back to Leaders", "view_leaders");
    if (l.image) {
      await ctx.replyWithPhoto(l.image, {
        caption: text,
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } else {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
    }
  } catch {
    await ctx.reply("\u274C Could not load leader details.");
  }
}
