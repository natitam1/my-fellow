import { BotContext } from "../context";
import { editOrSend } from "../message-manager";
import { InlineKeyboard } from "grammy";
import { getMyJoinRequests } from "../../api/teams";
import { getMyOrders } from "../../api/marketplace";
import { getMyGivings } from "../../api/payments";

export async function handleMyGivings(ctx: BotContext) {
  try {
    const result = await getMyGivings(ctx.session.token!);
    const givings = Array.isArray(result)
      ? result
      : result.givings || result.data || [];

    if (!givings.length)
      return editOrSend(ctx, "No contributions records found.");

    let text = "My Givings History\n\n";
    for (const g of givings) {
      text += `Amount: ${g.amount} ETB\nReason: ${g.reason}\nStatus: ${g.status}\nDate: ${new Date(g.createdAt).toLocaleDateString()}\n---\n`;
    }

    const kb = new InlineKeyboard().text("Back", "profile_menu");
    await editOrSend(ctx, text, { reply_markup: kb });
  } catch {
    await editOrSend(ctx, "Error loading your givings history.");
  }
}

export async function handleMyProfile(ctx: BotContext) {
  if (!ctx.session.token) {
    return ctx.reply("Please sign in first to access your profile.");
  }

  const user = ctx.session.user!;

  const text = `My Profile

Full Name: ${user.fullName}
Phone: ${user.phoneNumber}
Role: ${user.role}

View Profile - Detail account info
Edit Profile - Update your personal details
My Join Requests - Track team applications
My Orders - Check marketplace list
My Givings - Your contributions history`;

  const kb = new InlineKeyboard()
    .text("View Profile", "profile_view")
    .row()
    .text("Edit Profile", "profile_edit")
    .row()
    .text("My Join Requests", "profile_join_requests")
    .row()
    .text("My Orders", "profile_orders")
    .row()
    .text("My Givings", "profile_givings")
    .row()
    .text("Back", "back_to_menu");

  await editOrSend(ctx, text, { reply_markup: kb });
}

export async function handleJoinRequests(ctx: BotContext) {
  try {
    const result = await getMyJoinRequests(ctx.session.token!);
    const requests = Array.isArray(result)
      ? result
      : result.requests || result.data || [];

    if (!requests.length)
      return editOrSend(ctx, "No team join requests submitted.");

    let text = "My Join Requests\n\n";
    for (const req of requests) {
      text += `Team: ${req.teamId}\nStatus: ${req.status}\nDate: ${new Date(req.createdAt).toLocaleDateString()}\n---\n`;
    }

    const kb = new InlineKeyboard().text("Back", "profile_menu");
    await editOrSend(ctx, text, { reply_markup: kb });
  } catch {
    await editOrSend(ctx, "Error loading join requests.");
  }
}

export async function handleMyOrders(ctx: BotContext) {
  try {
    const result = await getMyOrders(ctx.session.token!);
    const orders = Array.isArray(result)
      ? result
      : result.orders || result.data || [];

    if (!orders.length) return editOrSend(ctx, "No marketplace orders found.");

    let text = "My Orders\n\n";
    for (const order of orders) {
      text += `Order ID: ${order.id}\nStatus: ${order.status}\nTotal: ${order.totalAmount} ETB\nDate: ${new Date(order.createdAt).toLocaleDateString()}\n---\n`;
    }

    const kb = new InlineKeyboard().text("Back", "profile_menu");
    await editOrSend(ctx, text, { reply_markup: kb });
  } catch {
    await editOrSend(ctx, "Error loading orders.");
  }
}
