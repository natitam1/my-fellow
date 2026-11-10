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
  let text = `<b>Programs</b>\n\nPage ${page} of ${Math.ceil(allPrograms.length / PAGE_SIZE)}\n\nExplore our scheduled programs:\n\n`;
  const kb = buildPaginationKeyboard("programs", page, hasMore);
  pagedPrograms.forEach((p: any, index: number) => {
    const num = (page - 1) * PAGE_SIZE + index + 1;
    text += `${num}. <b>${p.title}</b>\n`;
    if (p.description) text += `Description: ${p.description}\n`;
    if (p.day) text += `Day: ${p.day}\n`;
    if (p.time) text += `Time: ${p.time}\n`;
    if (p.location) {
      if (p.coordinates?.lat && p.coordinates?.lng) {
        text += `Location: <a href="https://www.google.com/maps/search/?api=1&query=${p.coordinates.lat},${p.coordinates.lng}">${p.location}</a>\n`;
      } else {
        text += `Location: ${p.location}\n`;
      }
    }
    text += `\n`;
  });
  await editOrSend(ctx, text.trimEnd(), { reply_markup: kb });
}
export async function handleProgramDetail(ctx: BotContext, id: string) {
  try {
    const result = await getProgramById(id);
    const p = result.program || result;
    let locationText = p.location || "N/A";
    if (p.coordinates?.lat && p.coordinates?.lng) {
      locationText = `<a href="https://www.google.com/maps/search/?api=1&query=${p.coordinates.lat},${p.coordinates.lng}">${p.location}</a>`;
    }
    const text = `<b>Program Detail</b>\n\nTitle: ${p.title}\nDescription: ${p.description || "N/A"}\n\nDay: ${p.day || "N/A"}\nTime: ${p.time || "N/A"}\nLocation: ${locationText}`;
    const kb = new InlineKeyboard().text("Back", "fi_programs");
    await editOrSend(ctx, text, { reply_markup: kb });
  } catch {
    await editOrSend(ctx, "Could not load program detail.");
  }
}
