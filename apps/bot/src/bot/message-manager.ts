import { BotContext } from "./context";
export async function editOrSend(ctx: BotContext, text: string, options: any = {}) {
    const lastId = ctx.session.lastBotMessageId;
    try {
        if (lastId) {
            const msg = await ctx.api.editMessageText(ctx.chat!.id, lastId, text, {
                parse_mode: "HTML",
                ...options,
            });
            return msg;
        }
    }
    catch (error: any) {
        if (lastId) {
            await ctx.api.deleteMessage(ctx.chat!.id, lastId).catch(() => { });
            ctx.session.lastBotMessageId = undefined;
        }
    }
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
        }
        catch { }
    }
}
