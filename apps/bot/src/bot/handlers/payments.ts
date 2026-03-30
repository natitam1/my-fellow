import { BotContext } from "../context";
import { initializePayment } from "../../api/payments";
import { editOrSend } from "../message-manager";
import { InlineKeyboard } from "grammy";
export async function handlePayments(ctx: BotContext) {
  if (!ctx.session.token) {
    return ctx.reply("Please sign in first to access giving.");
  }
  const text = `🎁 Gifts to Give\n\nMake a contribution or view your giving history:`;
  const kb = new InlineKeyboard()
    .text("Give Now", "pay_donate")
    .row()
    .text("Giving History", "pay_history");
  ctx.session.currentSection = "payments";
  await editOrSend(ctx, text, { reply_markup: kb });
}
export async function handleDonateStart(ctx: BotContext) {
  await ctx.reply(
    "\uD83C\uDF81 Giving Form\n\nPlease provide details in this format:\n\nAmount (number)\nFull Name\nPhone\nEmail\nReason (tithe/offering/etc)",
    {
      reply_markup: { force_reply: true },
    },
  );
  ctx.session.state = "BROWSING";
  (ctx.session as any).__pendingPayment = true;
}
export async function completePayment(ctx: BotContext, text: string) {
  const lines = text.split("\n").map((l) => l.trim());
  if (lines.length < 5) {
    return ctx.reply(
      "Incomplete form. Requires: Amount, Name, Phone, Email, Reason.",
    );
  }
  const amount = parseFloat(lines[0]);
  if (isNaN(amount) || amount <= 0) return ctx.reply("Invalid amount.");
  try {
    const result = await initializePayment(ctx.session.token!, {
      amount,
      fullName: lines[1],
      phoneNumber: lines[2],
      email: lines[3],
      reason: lines[4],
    });
    const checkoutUrl = result.checkoutUrl || result.data?.checkout_url;
    if (checkoutUrl) {
      const kb = new InlineKeyboard().url("Give Now", checkoutUrl);
      await ctx.reply(
        `Giving initialized for ${amount} ETB. Complete it via the link below:`,
        {
          reply_markup: kb,
        },
      );
    } else {
      await ctx.reply(
        "Giving initialized. Follow the instructions on your phone.",
      );
    }
  } catch (err: any) {
    await ctx.reply(`Giving failed: ${err.message}`);
  }
  delete (ctx.session as any).__pendingPayment;
}
