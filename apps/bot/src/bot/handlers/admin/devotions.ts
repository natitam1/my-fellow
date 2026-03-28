import { BotContext } from "../../context";
import { adminEntityMenu } from "../../keyboards";
import { editOrSend } from "../../message-manager";
import {
  getDevotions,
  createDevotion,
  deleteDevotion,
} from "../../../api/admin";

export async function handleAdminDevotionsMenu(ctx: BotContext) {
  ctx.session.adminForm = undefined;
  await editOrSend(ctx, "<b>Devotions Management</b>\n\nChoose an action:", {
    reply_markup: adminEntityMenu("devotions"),
  });
}

export async function handleAdminDevotionsList(ctx: BotContext) {
  if (!ctx.session.token) return;
  const page = ctx.session.currentPage || 1;
  try {
    const result = await getDevotions(ctx.session.token, page);
    const devotions = result.data;

    let text = `<b>Devotions</b>\n\n`;
    if (Array.isArray(devotions)) {
      devotions.forEach((d: any, i: number) => {
        text += `${i + 1}. <b>${d.title}</b> by ${d.author} (${d.type})\n`;
        text += `   /adm_devotions_del_${d._id}\n`;
      });
    }

    const kb: any[][] = [
      [{ text: "Add New", callback_data: "adm_devotions_add" }],
      [{ text: "Back", callback_data: "adm_devotions" }],
    ];
    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load devotions: ${err.message}`);
  }
}

const DEVOTION_STEPS = ["title", "author", "date", "type", "content"];

export async function handleAdminDevotionCreate(ctx: BotContext) {
  ctx.session.adminForm = { entity: "devotions", step: "title", data: {} };
  await ctx.reply(
    "<b>Create Devotion</b>\n\nStep 1/5: Enter the <b>title</b>:",
    { parse_mode: "HTML" },
  );
}

export async function handleAdminDevotionFormStep(
  ctx: BotContext,
  text: string,
): Promise<boolean> {
  const form = ctx.session.adminForm;
  if (!form || form.entity !== "devotions") return false;

  form.data[form.step] = text;

  const currentIdx = DEVOTION_STEPS.indexOf(form.step);
  const nextIdx = currentIdx + 1;

  if (nextIdx < DEVOTION_STEPS.length) {
    form.step = DEVOTION_STEPS[nextIdx];
    const prompts: Record<string, string> = {
      author: `Step 2/5: Enter the <b>author</b> name:`,
      date: `Step 3/5: Enter the <b>date</b> (YYYY-MM-DD):`,
      type: `Step 4/5: Enter the <b>type</b> (text, voice, pdf, book):`,
      content: `Step 5/5: Enter the <b>content</b> text:`,
    };
    await ctx.reply(prompts[form.step], { parse_mode: "HTML" });
    return true;
  }

  if (!ctx.session.token) return false;
  try {
    await createDevotion(ctx.session.token, form.data);
    ctx.session.adminForm = undefined;
    await ctx.reply("Devotion created successfully!");
    return true;
  } catch (err: any) {
    ctx.session.adminForm = undefined;
    await ctx.reply(
      `Failed to create devotion: ${err.response?.data?.message || err.message}`,
    );
    return true;
  }
}

export async function handleAdminDevotionDelete(ctx: BotContext, id: string) {
  if (!ctx.session.token) return;
  try {
    await deleteDevotion(ctx.session.token, id);
    await ctx.reply("Devotion deleted.");
  } catch (err: any) {
    await ctx.reply(
      `Failed to delete: ${err.response?.data?.message || err.message}`,
    );
  }
}
