import { BotContext } from "../../context";
import { adminEntityMenu } from "../../keyboards";
import { editOrSend } from "../../message-manager";
import { getPrograms, createProgram, deleteProgram } from "../../../api/admin";

export async function handleAdminProgramsMenu(ctx: BotContext) {
  ctx.session.adminForm = undefined;
  await editOrSend(ctx, "📋 <b>Programs Management</b>\n\nChoose an action:", {
    reply_markup: adminEntityMenu("programs"),
  });
}

export async function handleAdminProgramsList(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getPrograms(ctx.session.token);
    const programs = result.data;

    let text = `📋 <b>Programs</b> (${programs.length})\n\n`;
    programs.forEach((p: any, i: number) => {
      text += `${i + 1}. <b>${p.title}</b> — ${p.day} ${p.time}\n`;
      text += `   🗑 /adm_programs_del_${p._id}\n`;
    });

    const kb: any[][] = [
      [{ text: "➕ Add New", callback_data: "adm_programs_add" }],
      [{ text: "🔙 Back", callback_data: "adm_programs" }],
    ];
    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load programs: ${err.message}`);
  }
}

const PROGRAM_STEPS = [
  "title",
  "description",
  "day",
  "time",
  "category",
  "location",
];

export async function handleAdminProgramCreate(ctx: BotContext) {
  ctx.session.adminForm = { entity: "programs", step: "title", data: {} };
  await ctx.reply(
    "📋 <b>Create Program</b>\n\nStep 1/6: Enter the program <b>title</b>:",
    { parse_mode: "HTML" },
  );
}

export async function handleAdminProgramFormStep(
  ctx: BotContext,
  text: string,
): Promise<boolean> {
  const form = ctx.session.adminForm;
  if (!form || form.entity !== "programs") return false;

  form.data[form.step] = text;
  const currentIdx = PROGRAM_STEPS.indexOf(form.step);
  const nextIdx = currentIdx + 1;

  if (nextIdx < PROGRAM_STEPS.length) {
    form.step = PROGRAM_STEPS[nextIdx];
    const prompts: Record<string, string> = {
      description: `Step 2/6: Enter a <b>description</b> (at least 10 chars):`,
      day: `Step 3/6: Enter the <b>day</b> (e.g. Monday):`,
      time: `Step 4/6: Enter the <b>time</b> (e.g. 2:00 PM):`,
      category: `Step 5/6: Enter the <b>category</b>:`,
      location: `Step 6/6: Enter the <b>location</b>:`,
    };
    await ctx.reply(prompts[form.step], { parse_mode: "HTML" });
    return true;
  }

  if (!ctx.session.token) return false;
  try {
    const body = {
      ...form.data,
      coordinates: { lat: 9.0054, lng: 38.7636 },
      image: "https://placeholder.com/program.jpg",
    };
    await createProgram(ctx.session.token, body);
    ctx.session.adminForm = undefined;
    await ctx.reply("✅ Program created successfully!");
    return true;
  } catch (err: any) {
    ctx.session.adminForm = undefined;
    await ctx.reply(
      `❌ Failed to create program: ${err.response?.data?.message || err.message}`,
    );
    return true;
  }
}

export async function handleAdminProgramDelete(ctx: BotContext, id: string) {
  if (!ctx.session.token) return;
  try {
    await deleteProgram(ctx.session.token, id);
    await ctx.reply("✅ Program deleted.");
  } catch (err: any) {
    await ctx.reply(
      `❌ Failed to delete: ${err.response?.data?.message || err.message}`,
    );
  }
}
