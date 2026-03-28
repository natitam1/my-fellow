import { BotContext } from "../../context";
import { adminEntityMenu } from "../../keyboards";
import { editOrSend } from "../../message-manager";
import { getLeaders, createLeader, deleteLeader } from "../../../api/admin";

export async function handleAdminLeadersMenu(ctx: BotContext) {
  ctx.session.adminForm = undefined;
  await editOrSend(ctx, "👔 <b>Leaders Management</b>\n\nChoose an action:", {
    reply_markup: adminEntityMenu("leaders"),
  });
}

export async function handleAdminLeadersList(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getLeaders(ctx.session.token);
    const leaders = result.data;

    let text = `👔 <b>Leaders</b> (${leaders.length})\n\n`;
    leaders.forEach((l: any, i: number) => {
      text += `${i + 1}. <b>${l.name}</b> — ${l.role} (${l.type})\n`;
      text += `   🗑 /adm_leaders_del_${l._id}\n`;
    });

    const kb: any[][] = [
      [{ text: "➕ Add New", callback_data: "adm_leaders_add" }],
      [{ text: "🔙 Back", callback_data: "adm_leaders" }],
    ];
    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load leaders: ${err.message}`);
  }
}

const LEADER_STEPS = ["name", "role", "bio", "phoneNumber", "telegram", "type"];

export async function handleAdminLeaderCreate(ctx: BotContext) {
  ctx.session.adminForm = { entity: "leaders", step: "name", data: {} };
  await ctx.reply(
    "👔 <b>Create Leader</b>\n\nStep 1/6: Enter the leader's <b>name</b>:",
    { parse_mode: "HTML" },
  );
}

export async function handleAdminLeaderFormStep(
  ctx: BotContext,
  text: string,
): Promise<boolean> {
  const form = ctx.session.adminForm;
  if (!form || form.entity !== "leaders") return false;

  form.data[form.step] = text;
  const currentIdx = LEADER_STEPS.indexOf(form.step);
  const nextIdx = currentIdx + 1;

  if (nextIdx < LEADER_STEPS.length) {
    form.step = LEADER_STEPS[nextIdx];
    const prompts: Record<string, string> = {
      role: `Step 2/6: Enter the <b>role</b> (e.g. President, Vice President):`,
      bio: `Step 3/6: Enter a <b>bio</b> (at least 10 characters):`,
      phoneNumber: `Step 4/6: Enter the <b>phone number</b>:`,
      telegram: `Step 5/6: Enter the <b>Telegram handle</b>:`,
      type: `Step 6/6: Enter the <b>type</b> (e.g. executive, team_leader):`,
    };
    await ctx.reply(prompts[form.step], { parse_mode: "HTML" });
    return true;
  }

  if (!ctx.session.token) return false;
  try {
    await createLeader(ctx.session.token, form.data);
    ctx.session.adminForm = undefined;
    await ctx.reply("✅ Leader created successfully!");
    return true;
  } catch (err: any) {
    ctx.session.adminForm = undefined;
    await ctx.reply(
      `❌ Failed to create leader: ${err.response?.data?.message || err.message}`,
    );
    return true;
  }
}

export async function handleAdminLeaderDelete(ctx: BotContext, id: string) {
  if (!ctx.session.token) return;
  try {
    await deleteLeader(ctx.session.token, id);
    await ctx.reply("✅ Leader deleted.");
  } catch (err: any) {
    await ctx.reply(
      `❌ Failed to delete: ${err.response?.data?.message || err.message}`,
    );
  }
}
