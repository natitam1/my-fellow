import { BotContext } from "../context";
import { getAllLeaders } from "../../api/leaders";
import { editOrSend } from "../message-manager";
import { InlineKeyboard } from "grammy";

export async function handleLeadersList(ctx: BotContext) {
  try {
    const result = await getAllLeaders();
    const leaders = Array.isArray(result)
      ? result
      : result.leaders || result.data || [];

    if (!leaders.length) {
      return editOrSend(ctx, "No leaders found.");
    }

    let text = "<b>Fellowship Leaders</b>\n\n";

    for (const leader of leaders) {
      const handle = leader.telegram.replace("@", "");
      const tgLink = `https://t.me/${handle}`;
      const phone = leader.phoneNumber || "N/A";

      text += `<b>${leader.name}</b>\n`;
      text += `Role: ${leader.role || "N/A"}\n`;
      text += `Phone: <code>${phone}</code>\n`;
      text += `Telegram: <a href="${tgLink}">@${handle}</a>\n\n`;
    }

    const kb = new InlineKeyboard().text("Back", "fi_menu");
    await editOrSend(ctx, text, { reply_markup: kb, parse_mode: "HTML" });
  } catch (error: any) {
    console.error("Leaders List Error:", error);
    await editOrSend(ctx, "Failed to load leaders.");
  }
}
