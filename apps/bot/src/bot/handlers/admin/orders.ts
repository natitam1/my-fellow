import { BotContext } from "../../context";
import { editOrSend } from "../../message-manager";
import { getOrders, updateOrderStatus } from "../../../api/admin";

export async function handleAdminOrdersList(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getOrders(ctx.session.token);
    const orders = result.data;

    let text = `📦 <b>Orders</b>\n\n`;
    if (Array.isArray(orders)) {
      orders.forEach((o: any, i: number) => {
        const user = o.userId?.fullName || o.user?.fullName || "Unknown";
        text += `${i + 1}. <b>${user}</b> — ${o.status}\n`;
        if (o.status === "pending") {
          text += `   ✅ /adm_orders_approve_${o._id}\n`;
          text += `   ❌ /adm_orders_reject_${o._id}\n`;
        }
      });
    }

    const kb: any[][] = [[{ text: "🔙 Back", callback_data: "adm_menu" }]];
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
    await ctx.reply(`✅ Order ${status} successfully.`);
  } catch (err: any) {
    await ctx.reply(
      `❌ Failed to update order: ${err.response?.data?.message || err.message}`,
    );
  }
}
