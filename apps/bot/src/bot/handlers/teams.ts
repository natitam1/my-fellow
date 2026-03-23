import { BotContext } from "../context";
import { getAllTeams, getTeamById } from "../../api/teams";
import { editOrSend } from "../message-manager";
import { buildPaginationKeyboard } from "../keyboards";
import { InlineKeyboard } from "grammy";

const PAGE_SIZE = 5;

export async function handleTeamsList(ctx: BotContext) {
  ctx.session.currentSection = "teams";
  const page = ctx.session.currentPage || 1;
  const result = await getAllTeams();
  const allTeams = Array.isArray(result) ? result : result.teams || result.data || [];
  
  if (!allTeams.length) return editOrSend(ctx, "No teams found.");
  
  const start = (page - 1) * PAGE_SIZE;
  const pagedTeams = allTeams.slice(start, start + PAGE_SIZE);
  const hasMore = allTeams.length > start + PAGE_SIZE;

  let text = `Teams\n\nPage ${page} of ${Math.ceil(allTeams.length / PAGE_SIZE)}\n\nExplore our teams and ministries:\n\n`;
  const kb = buildPaginationKeyboard("teams", page, hasMore, "fi_menu");
  
  for (const team of pagedTeams) {
    kb.text(team.name, `team_view_${team._id}`).row();
  }
  
  await editOrSend(ctx, text, { reply_markup: kb });
}

export async function handleTeamDetail(ctx: BotContext, id: string) {
  try {
    const result = await getTeamById(id);
    const team = result.team || result;
    const text = `Team Detail\n\nName: ${team.name}\nDescription: ${team.description || "N/A"}\n\nCategory: ${team.category || "N/A"}\nLocation: ${team.location || "N/A"}\nLeader: ${team.leader?.name || "N/A"}`;
    
    const kb = new InlineKeyboard()
      .text("Join Team", `team_join_${team._id}`).row()
      .text("Back", "fi_teams");
      
    await editOrSend(ctx, text, { reply_markup: kb });
  } catch {
    await editOrSend(ctx, "Could not load team detail.");
  }
}
