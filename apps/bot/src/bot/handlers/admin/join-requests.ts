import { BotContext } from "../../context";
import { editOrSend } from "../../message-manager";
import { getJoinRequests, updateJoinRequestStatus } from "../../../api/admin";

export async function handleAdminJoinRequestsList(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getJoinRequests(ctx.session.token);
    const requests = result.data;

    let text = `<b>Join Requests</b>\n\n`;
    if (Array.isArray(requests)) {
      requests.forEach((r: any, i: number) => {
        const user = r.userId?.fullName || r.user?.fullName || "Unknown";
        const team = r.teamId?.name || r.team?.name || "Unknown";
        text += `${i + 1}. <b>${user}</b> → ${team} (${r.status})\n`;
        if (r.status === "pending") {
          text += `   /adm_joinreqs_approve_${r._id}\n`;
          text += `   /adm_joinreqs_reject_${r._id}\n`;
        }
      });
    }

    const kb: any[][] = [[{ text: "Back", callback_data: "adm_menu" }]];
    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load join requests: ${err.message}`);
  }
}

export async function handleAdminJoinRequestStatus(
  ctx: BotContext,
  id: string,
  status: string,
) {
  if (!ctx.session.token) return;
  try {
    await updateJoinRequestStatus(ctx.session.token, id, status);
    await ctx.reply(`Join request ${status} successfully.`);
  } catch (err: any) {
    await ctx.reply(
      `Failed to update: ${err.response?.data?.message || err.message}`,
    );
  }
}
