import { BotContext } from "../context";
import { getAllLeaders, getLeaderById } from "../../api/leaders";
import { editOrSend } from "../message-manager";
import { buildPaginationKeyboard } from "../keyboards";
import { InlineKeyboard } from "grammy";

const PAGE_SIZE = 5;

export async function handleLeadersList(ctx: BotContext) {
  ctx.session.currentSection = "leaders";
  const page = ctx.session.currentPage || 1;
  const result = await getAllLeaders();
  const allLeaders = Array.isArray(result) ? result : result.leaders || result.data || [];
  
  if (!allLeaders.length) return editOrSend(ctx, "No leaders found.");
  
  const start = (page - 1) * PAGE_SIZE;
  const pagedLeaders = allLeaders.slice(start, start + PAGE_SIZE);
  const hasMore = allLeaders.length > start + PAGE_SIZE;

  let text = `Leaders\n\nPage ${page} of ${Math.ceil(allLeaders.length / PAGE_SIZE)}\n\nMeet our leadership team:\n\n`;
  const kb = buildPaginationKeyboard("leaders", page, hasMore, "fi_menu");
  
  for (const leader of pagedLeaders) {
    kb.text(leader.name, `leader_view_${leader._id}`).row();
  }
  
  await editOrSend(ctx, text, { reply_markup: kb });
}

export async function handleLeaderDetail(ctx: BotContext, id: string) {
  try {
    const result = await getLeaderById(id);
    const l = result.leader || result;
    const text = `Leader Detail\n\nName: ${l.name}\nRole: ${l.role || "N/A"}\n\nPhone: ${l.phoneNumber || "N/A"}\nTelegram: ${l.telegram || "N/A"}\n\nBio:\n${l.bio || "N/A"}`;
    
    const kb = new InlineKeyboard();
    if (l.telegram) {
      kb.url("Message on Telegram", `https://t.me/${l.telegram.replace("@", "")}`).row();
    }
    kb.text("Back", "fi_leaders");
      
    await editOrSend(ctx, text, { reply_markup: kb });
  } catch {
    await editOrSend(ctx, "Could not load leader detail.");
  }
}
