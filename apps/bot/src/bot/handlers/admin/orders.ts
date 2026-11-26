import { BotContext } from "../../context";
import { editOrSend } from "../../message-manager";
import { getOrders, updateOrderStatus } from "../../../api/admin";
import { escapeHtml } from "../../../utils/html";

export async function handleAdminOrdersList(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getOrders(ctx.session.token);
    const orders = result.data;

    let text = `<b>Orders</b>\n\n`;
    if (Array.isArray(orders)) {
      orders.forEach((o: any, i: number) => {
        const orderId = o.id || o._id;
        const user = escapeHtml(
          o.userId?.fullName || o.user?.fullName || "Unknown",
        );
        const status = escapeHtml(o.status);
        text += `${i + 1}. <b>${user}</b> — ${status}\n`;
        if (o.status === "PENDING") {
          text += `   /adm_orders_approve_${orderId}\n`;
          text += `   /adm_orders_reject_${orderId}\n`;
        }
      });
    }

    const kb: any[][] = [[{ text: "Back", callback_data: "adm_menu" }]];
    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load orders: ${err.message}`);
  }
}

export async function handleAdminOrderStatus(
  ctx: BotContext,
  id: string,
  status: string,
) {
  if (!ctx.session.token) return;
  try {
    await updateOrderStatus(ctx.session.token, id, status);
    await ctx.reply(`Order ${status} successfully.`);
  } catch (err: any) {
    await ctx.reply(
      `Failed to update order: ${err.response?.data?.message || err.message}`,
    );
  }
}
