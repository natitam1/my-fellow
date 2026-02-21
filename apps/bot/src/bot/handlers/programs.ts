import { BotContext } from "../context";
import { getAllPrograms, getProgramById } from "../../api/programs";
import { InlineKeyboard } from "grammy";

export async function handleViewPrograms(ctx: BotContext) {
  try {
    const result = await getAllPrograms();
    const programs = Array.isArray(result)
      ? result
      : result.programs || result.data || [];

    if (!programs.length) {
      await ctx.reply("📆 No programs available.");
      return;
    }

    const kb = new InlineKeyboard();
    for (const p of programs.slice(0, 10)) {
      kb.text(`📆 ${p.title}`, `program_${p._id}`).row();
    }
    kb.text("🔙 Back to Menu", "back_to_menu");

    await ctx.reply("📆 *Programs*\n\nSelect a program:", {
      parse_mode: "Markdown",
      reply_markup: kb,
    });
  } catch (err: any) {
    await ctx.reply("❌ Failed to load programs.");
  }
}

export async function handleProgramDetail(ctx: BotContext, programId: string) {
  try {
    const result = await getProgramById(programId);
    const p = result.program || result;

    let text = `📆 *${p.title}*\n\n`;
    if (p.description) text += `📝 ${p.description}\n\n`;
    if (p.day) text += `📅 Day: ${p.day}\n`;
    if (p.time) text += `⏰ Time: ${p.time}\n`;
    if (p.category) text += `📂 Category: ${p.category}\n`;
    if (p.location) text += `📍 Location: ${p.location}\n`;

    const kb = new InlineKeyboard().text(
      "🔙 Back to Programs",
      "view_programs",
    );

    if (p.image) {
      await ctx.replyWithPhoto(p.image, {
        caption: text,
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } else {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
    }
  } catch {
    await ctx.reply("❌ Could not load program details.");
  }
}
