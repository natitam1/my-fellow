import { BotContext } from "../context";
import { initializePayment } from "../../api/payments";
import { InlineKeyboard } from "grammy";

/**
 * Start the payment / contribution flow.
 */
export async function handleStartPayment(ctx: BotContext) {
  if (!ctx.session.token) {
    await ctx.reply("🔒 Please log in first to make a contribution.");
    return;
  }

  await ctx.reply(
    "💸 *Make a Contribution*\n\n" +
      "Please send the following details (each on a new line):\n\n" +
      "Amount (number)\n" +
      "Full Name\n" +
      "Phone Number\n" +
      "Email\n" +
      "Reason (e.g. tithe, offering, gift)",
    { parse_mode: "Markdown" },
  );

  (ctx.session as any).__pendingPayment = true;
}

/**
 * Complete the payment after receiving text input.
 */
export async function completePayment(ctx: BotContext, text: string) {
  const pending = (ctx.session as any).__pendingPayment;
  if (!pending) return false;

  const lines = text.split("\n").map((l) => l.trim());
  if (lines.length < 5) {
    await ctx.reply(
      "⚠️ Please provide all 5 lines:\nAmount\nFull Name\nPhone\nEmail\nReason",
    );
    return true;
  }

  const amount = parseFloat(lines[0]);
  if (isNaN(amount) || amount <= 0) {
    await ctx.reply("⚠️ Amount must be a number greater than 0.");
    return true;
  }

  try {
    const result = await initializePayment(ctx.session.token!, {
      amount,
      fullName: lines[1],
      phoneNumber: lines[2],
      email: lines[3],
      reason: lines[4],
    });

    const checkoutUrl =
      result.checkoutUrl || result.data?.checkout_url || result.checkout_url;

    if (checkoutUrl) {
      const kb = new InlineKeyboard().url("💳 Pay Now", checkoutUrl);
      await ctx.reply(
        `✅ *Payment initialized!*\n\nAmount: *${amount} ETB*\n\nClick the button below to complete your payment:`,
        { parse_mode: "Markdown", reply_markup: kb },
      );
    } else {
      await ctx.reply(
        "✅ Payment initialized! Check your phone for a payment prompt.",
      );
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    await ctx.reply(`❌ Payment failed: ${msg}`);
  }

  delete (ctx.session as any).__pendingPayment;
  return true;
}
