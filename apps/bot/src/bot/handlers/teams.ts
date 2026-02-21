import { BotContext } from "../context";
import { getAllTeams, getTeamById, createJoinRequest } from "../../api/teams";
import { InlineKeyboard } from "grammy";

/**
 * Show all teams as inline buttons.
 */
export async function handleViewTeams(ctx: BotContext) {
  try {
    const result = await getAllTeams();
    const teams = Array.isArray(result)
      ? result
      : result.teams || result.data || [];

    if (!teams.length) {
      await ctx.reply("👥 No teams available.");
      return;
    }

    const kb = new InlineKeyboard();
    for (const team of teams.slice(0, 15)) {
      kb.text(team.name, `team_${team._id}`).row();
    }
    kb.text("🔙 Back to Menu", "back_to_menu");

    await ctx.reply("👥 *Teams*\n\nSelect a team to learn more:", {
      parse_mode: "Markdown",
      reply_markup: kb,
    });
  } catch (err: any) {
    await ctx.reply("❌ Failed to load teams.");
    console.error("handleViewTeams error:", err.message);
  }
}

/**
 * Show team details.
 */
export async function handleTeamDetail(ctx: BotContext, teamId: string) {
  try {
    const result = await getTeamById(teamId);
    const team = result.team || result;

    let text = `👥 *${team.name}*\n\n`;
    text += `📝 ${team.description || ""}\n\n`;
    if (team.category) text += `📂 Category: ${team.category}\n`;
    if (team.location) text += `📍 Location: ${team.location}\n`;
    if (team.meetingDay) text += `📅 Meeting: ${team.meetingDay}`;
    if (team.time) text += ` at ${team.time}`;
    text += "\n";
    if (team.leader?.name) text += `\n👤 Leader: ${team.leader.name}`;

    const kb = new InlineKeyboard();
    if (ctx.session.token) {
      kb.text("📝 Request to Join", `join_team_${team._id}`).row();
    }
    kb.text("🔙 Back to Teams", "view_teams");

    if (team.image) {
      await ctx.replyWithPhoto(team.image, {
        caption: text,
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } else {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
    }
  } catch (err: any) {
    await ctx.reply("❌ Could not load team details.");
  }
}

/**
 * Start team join request flow.
 */
export async function handleJoinTeam(ctx: BotContext, teamId: string) {
  if (!ctx.session.token) {
    await ctx.reply("🔒 Please log in first to join a team.");
    return;
  }

  await ctx.reply(
    "📝 *Join Request*\n\n" +
      "Please send your details (each on a new line):\n\n" +
      "Full Name\n" +
      "Phone Number\n" +
      "Department\n" +
      "Year\n" +
      "Your Telegram Handle (e.g. @username)\n" +
      "Why do you want to join? (short message)",
    { parse_mode: "Markdown" },
  );

  (ctx.session as any).__pendingJoinReq = { teamId };
}

/**
 * Complete the join request after receiving text input.
 */
export async function completeJoinRequest(ctx: BotContext, text: string) {
  const pending = (ctx.session as any).__pendingJoinReq;
  if (!pending) return false;

  const lines = text.split("\n").map((l) => l.trim());
  if (lines.length < 6) {
    await ctx.reply(
      "⚠️ Please provide all 6 lines:\nFull Name\nPhone\nDepartment\nYear\nTelegram Handle\nMessage",
    );
    return true;
  }

  try {
    await createJoinRequest(ctx.session.token!, {
      teamId: pending.teamId,
      fullName: lines[0],
      phoneNumber: lines[1],
      department: lines[2],
      year: lines[3],
      telegramHandle: lines[4],
      message: lines[5],
    });
    await ctx.reply(
      "🎉 *Join request submitted!* You will be notified when it is reviewed.",
      {
        parse_mode: "Markdown",
      },
    );
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    await ctx.reply(`❌ Join request failed: ${msg}`);
  }

  delete (ctx.session as any).__pendingJoinReq;
  return true;
}
