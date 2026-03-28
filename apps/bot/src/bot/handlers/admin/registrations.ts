import { BotContext } from "../../context";
import { editOrSend } from "../../message-manager";
import { getAdminRegistrations } from "../../../api/admin";

export async function handleAdminRegistrationsList(ctx: BotContext) {
  if (!ctx.session.token) return;
  const page = ctx.session.currentPage || 1;
  try {
    const result = await getAdminRegistrations(ctx.session.token, page);
    const registrations = result.data;
    const { total, totalPages } = result.pagination;

    let text = `<b>Registrations</b> (${total} total, page ${page}/${totalPages})\n\n`;
    registrations.forEach((r: any, i: number) => {
      text += `${(page - 1) * 10 + i + 1}. <b>${r.user?.fullName || "Unknown"}</b> → ${r.event?.title || "Unknown"}\n`;
    });

    const kb: any[][] = [];
    const nav: any[] = [];
    if (page > 1)
      nav.push({
        text: "Prev",
        callback_data: `adm_registrations_page_${page - 1}`,
      });
    if (page < totalPages)
      nav.push({
        text: "Next",
        callback_data: `adm_registrations_page_${page + 1}`,
      });
    if (nav.length) kb.push(nav);
    kb.push([{ text: "Back", callback_data: "adm_menu" }]);

    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load registrations: ${err.message}`);
  }
}
