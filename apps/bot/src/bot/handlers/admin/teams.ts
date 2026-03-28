import { BotContext } from "../../context";
import { adminEntityMenu } from "../../keyboards";
import { editOrSend } from "../../message-manager";
import { getTeams, createTeam, deleteTeam } from "../../../api/admin";

export async function handleAdminTeamsMenu(ctx: BotContext) {
  ctx.session.adminForm = undefined;
  await editOrSend(ctx, "🏠 <b>Teams Management</b>\n\nChoose an action:", {
    reply_markup: adminEntityMenu("teams"),
  });
}

export async function handleAdminTeamsList(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getTeams(ctx.session.token);
    const teams = result.data;

    let text = `🏠 <b>Teams</b> (${teams.length})\n\n`;
    teams.forEach((t: any, i: number) => {
      text += `${i + 1}. <b>${t.name}</b> — ${t.members} members\n`;
      text += `   🗑 /adm_teams_del_${t._id}\n`;
    });

    const kb: any[][] = [
      [{ text: "➕ Add New", callback_data: "adm_teams_add" }],
      [{ text: "🔙 Back", callback_data: "adm_teams" }],
    ];
    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load teams: ${err.message}`);
  }
}

const TEAM_STEPS = [
  "name",
  "description",
  "category",
  "meetingDay",
  "time",
  "location",
];

export async function handleAdminTeamCreate(ctx: BotContext) {
  ctx.session.adminForm = { entity: "teams", step: "name", data: {} };
  await ctx.reply(
    "🏠 <b>Create Team</b>\n\nStep 1/6: Enter the team <b>name</b>:",
    { parse_mode: "HTML" },
  );
}

export async function handleAdminTeamFormStep(
  ctx: BotContext,
  text: string,
): Promise<boolean> {
  const form = ctx.session.adminForm;
  if (!form || form.entity !== "teams") return false;

  form.data[form.step] = text;
  const currentIdx = TEAM_STEPS.indexOf(form.step);
  const nextIdx = currentIdx + 1;

  if (nextIdx < TEAM_STEPS.length) {
    form.step = TEAM_STEPS[nextIdx];
    const prompts: Record<string, string> = {
      description: `Step 2/6: Enter a <b>description</b> (at least 10 chars):`,
      category: `Step 3/6: Enter the <b>category</b>:`,
      meetingDay: `Step 4/6: Enter the <b>meeting day</b> (e.g. Saturday):`,
      time: `Step 5/6: Enter the <b>meeting time</b> (e.g. 3:00 PM):`,
      location: `Step 6/6: Enter the <b>meeting location</b>:`,
    };
    await ctx.reply(prompts[form.step], { parse_mode: "HTML" });
    return true;
  }

  if (!ctx.session.token) return false;
  try {
    const body = {
      ...form.data,
      icon: "👥",
      color: "#4A90D9",
      members: 0,
      about: form.data.description,
      coordinates: { lat: 9.0054, lng: 38.7636 },
      imageUrl: "https://placeholder.com/team.jpg",
      leader: {
        name: "TBD",
        role: "Leader",
        imageUrl: "https://placeholder.com/leader.jpg",
        telegram: "@tbd",
        phone: "0000000000",
      },
    };
    await createTeam(ctx.session.token, body);
    ctx.session.adminForm = undefined;
    await ctx.reply("✅ Team created successfully!");
    return true;
  } catch (err: any) {
    ctx.session.adminForm = undefined;
    await ctx.reply(
      `❌ Failed to create team: ${err.response?.data?.message || err.message}`,
    );
    return true;
  }
}

export async function handleAdminTeamDelete(ctx: BotContext, id: string) {
  if (!ctx.session.token) return;
  try {
    await deleteTeam(ctx.session.token, id);
    await ctx.reply("✅ Team deleted.");
  } catch (err: any) {
    await ctx.reply(
      `❌ Failed to delete: ${err.response?.data?.message || err.message}`,
    );
  }
}
