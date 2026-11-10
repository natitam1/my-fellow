import { BotContext } from "./context";
export async function editOrSend(
  ctx: BotContext,
  text: string,
  options: any = {},
  media?: string,
) {
  const lastId = ctx.session.lastBotMessageId;
  const isCallback = ctx.callbackQuery !== undefined;

  // For callbacks, try to edit the existing message
  if (isCallback && lastId) {
    try {
      if (media) {
        const msg = await ctx.api.editMessageMedia(
          ctx.chat!.id,
          lastId,
          {
            type: "photo",
            media: media,
            caption: text,
            parse_mode: "HTML",
          },
          { reply_markup: options.reply_markup },
        );
        return msg;
      } else {
        const msg = await ctx.api.editMessageText(ctx.chat!.id, lastId, text, {
          parse_mode: "HTML",
          ...options,
        });
        return msg;
      }
    } catch (error: any) {
      // If edit fails, fall through to sending a new message
    }
  }

  // Send new message
  let msg;
  if (media) {
    msg = await ctx.replyWithPhoto(media, {
      caption: text,
      parse_mode: "HTML",
      ...options,
    });
  } else {
    msg = await ctx.reply(text, {
      parse_mode: "HTML",
      ...options,
    });
  }
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
