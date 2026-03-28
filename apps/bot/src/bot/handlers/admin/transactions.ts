import { BotContext } from "../../context";
import { editOrSend } from "../../message-manager";
import { getAdminTransactions } from "../../../api/admin";

export async function handleAdminTransactionsList(ctx: BotContext) {
  if (!ctx.session.token) return;
  const page = ctx.session.currentPage || 1;
  try {
    const result = await getAdminTransactions(ctx.session.token, page);
    const transactions = result.data;
    const { total, totalPages } = result.pagination;

    let text = `💰 <b>Transactions</b> (${total} total, page ${page}/${totalPages})\n\n`;
    transactions.forEach((tx: any, i: number) => {
      const name = tx.userId?.fullName || "Unknown";
      text += `${(page - 1) * 10 + i + 1}. <b>${name}</b>: ${tx.amount} ETB (${tx.status})\n`;
    });

    const kb: any[][] = [];
    const nav: any[] = [];
    if (page > 1)
      nav.push({
        text: "⬅️ Prev",
        callback_data: `adm_transactions_page_${page - 1}`,
      });
    if (page < totalPages)
      nav.push({
        text: "➡️ Next",
        callback_data: `adm_transactions_page_${page + 1}`,
      });
    if (nav.length) kb.push(nav);
    kb.push([{ text: "🔙 Back", callback_data: "adm_menu" }]);

    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load transactions: ${err.message}`);
  }
}
