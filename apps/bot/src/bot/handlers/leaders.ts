import { BotContext } from "../context";
import { getAllLeaders } from "../../api/leaders";
import { editOrSend } from "../message-manager";
import { InlineKeyboard } from "grammy";

const PAGE_SIZE = 5;

export async function handleLeadersList(ctx: BotContext) {
  try {
    ctx.session.currentSection = "leaders";
    const page = ctx.session.currentPage || 1;

    const result = await getAllLeaders();
    const allLeaders = Array.isArray(result)
      ? result
      : result.leaders || result.data || [];

    if (!allLeaders.length) {
      return editOrSend(ctx, "No leaders found.");
    }

    const totalPages = Math.ceil(allLeaders.length / PAGE_SIZE);
    const validPage = Math.max(1, Math.min(page, totalPages));

    const start = (validPage - 1) * PAGE_SIZE;
    const pagedLeaders = allLeaders.slice(start, start + PAGE_SIZE);

    let text = `<b>Fellowship Leaders</b> (Page ${validPage}/${totalPages})\n\n`;

    for (const leader of pagedLeaders) {
      const handle = leader.telegram.replace("@", "");
      const tgLink = `https://t.me/${handle}`;
      const phone = leader.phoneNumber || "N/A";

      text += `<b>${leader.name}</b>\n`;
      text += `Role: ${leader.role || "N/A"}\n`;
      text += `Phone: <code>${phone}</code>\n`;
      text += `Telegram: <a href="${tgLink}">@${handle}</a>\n\n`;
    }

    const kb = new InlineKeyboard();

    if (validPage > 1) {
      kb.text("« Prev", `leaders_page_${validPage - 1}`);
    }
    if (validPage < totalPages) {
      kb.text("Next »", `leaders_page_${validPage + 1}`);
    }

    kb.row().text("Back", "fi_menu");
    await editOrSend(ctx, text, { reply_markup: kb, parse_mode: "HTML" });
  } catch (error: any) {
    console.error("Leaders List Error:", error);
    await editOrSend(ctx, "Failed to load leaders.");
  }
}
