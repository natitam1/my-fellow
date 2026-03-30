import { BotContext } from "./context";
export async function editOrSend(
  ctx: BotContext,
  text: string,
  options: any = {},
) {
  const lastId = ctx.session.lastBotMessageId;
  const isCallback = ctx.callbackQuery !== undefined;

  // For non-callbacks (reply keyboard buttons), always delete previous and send new
  if (!isCallback && lastId) {
    await ctx.api.deleteMessage(ctx.chat!.id, lastId).catch(() => {});
    ctx.session.lastBotMessageId = undefined;
  }

  // For callbacks, try to edit the existing message
  if (isCallback && ctx.session.lastBotMessageId) {
    try {
      const msg = await ctx.api.editMessageText(
        ctx.chat!.id,
        ctx.session.lastBotMessageId,
        text,
        {
          parse_mode: "HTML",
          ...options,
        },
      );
      return msg;
    } catch (error: any) {
      // If edit fails (e.g. caption message vs text message), delete and fallback
      await ctx.api
        .deleteMessage(ctx.chat!.id, ctx.session.lastBotMessageId)
        .catch(() => {});
      ctx.session.lastBotMessageId = undefined;
    }
  }

  // Default: Send new message
  const msg = await ctx.reply(text, {
    parse_mode: "HTML",
    ...options,
  });
  ctx.session.lastBotMessageId = msg.message_id;
  return msg;
}
export async function deleteLastBotMessage(ctx: BotContext) {
  const lastId = ctx.session.lastBotMessageId;
  if (lastId) {
    try {
      await ctx.api.deleteMessage(ctx.chat!.id, lastId);
      ctx.session.lastBotMessageId = undefined;
    } catch {}
  }
}
