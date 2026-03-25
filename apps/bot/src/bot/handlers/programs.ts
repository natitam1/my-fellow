import { BotContext } from "../context";
import { getAllPrograms, getProgramById } from "../../api/programs";
import { editOrSend } from "../message-manager";
import { buildPaginationKeyboard } from "../keyboards";
import { InlineKeyboard } from "grammy";

const PAGE_SIZE = 5;

export async function handleProgramsList(ctx: BotContext) {
  ctx.session.currentSection = "programs";
  const page = ctx.session.currentPage || 1;
  const result = await getAllPrograms();
  const allPrograms = Array.isArray(result)
    ? result
    : result.programs || result.data || [];

  if (!allPrograms.length) return editOrSend(ctx, "No programs found.");

  const start = (page - 1) * PAGE_SIZE;
  const pagedPrograms = allPrograms.slice(start, start + PAGE_SIZE);
  const hasMore = allPrograms.length > start + PAGE_SIZE;

  let text = `Programs\n\nPage ${page} of ${Math.ceil(allPrograms.length / PAGE_SIZE)}\n\nExplore our scheduled programs:\n\n`;
  const kb = buildPaginationKeyboard("programs", page, hasMore, "fi_menu");

  for (const prog of pagedPrograms) {
    kb.text(prog.title, `program_view_${prog._id}`).row();
  }

  await editOrSend(ctx, text, { reply_markup: kb });
}

export async function handleProgramDetail(ctx: BotContext, id: string) {
  try {
    const result = await getProgramById(id);
    const p = result.program || result;
    const text = `Program Detail\n\nTitle: ${p.title}\nDescription: ${p.description || "N/A"}\n\nDay: ${p.day || "N/A"}\nTime: ${p.time || "N/A"}\nLocation: ${p.location || "N/A"}`;

    const kb = new InlineKeyboard().text("Back", "fi_programs");

    await editOrSend(ctx, text, { reply_markup: kb });
  } catch {
    await editOrSend(ctx, "Could not load program detail.");
  }
}
