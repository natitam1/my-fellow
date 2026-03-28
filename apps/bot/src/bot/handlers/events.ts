import { BotContext } from "../context";
import { getAllEvents, registerForEvent } from "../../api/events";
import { deleteLastBotMessage, editOrSend } from "../message-manager";
import { InlineKeyboard } from "grammy";
const MAX_CAPTION_LENGTH = 1024;
function escapeHTML(str: string) {
    return str.replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;",
    })[m] || m);
}
function sanitizeImageUrl(url: string | undefined): string | undefined {
    if (!url)
        return undefined;
    if (url.toLowerCase().endsWith(".avif")) {
        if (url.includes("cloudinary.com")) {
            return url
                .replace(/\/upload\/(v\d+)/, "/upload/f_jpg/$1")
                .replace(/\.avif$/i, ".jpg");
        }
        return undefined;
    }
    return url;
}
export async function handleEventsList(ctx: BotContext) {
    ctx.session.currentSection = "events";
    const page = ctx.session.currentPage || 1;
    try {
        const result = await getAllEvents();
        const allEvents = Array.isArray(result)
            ? result
            : result.events || result.data || [];
        if (!allEvents.length) {
            return editOrSend(ctx, "No events available at this time.");
        }
        let validPage = page;
        if (page > allEvents.length)
            validPage = allEvents.length;
        if (page < 1)
            validPage = 1;
        const event = allEvents[validPage - 1];
        if (!event)
            return;
        const hasMore = validPage < allEvents.length;
        let titleText = `<b>${escapeHTML(event.title)}</b>\n\n`;
        let bodyText = "";
        if (event.shortDescription) {
            bodyText += `${escapeHTML(event.shortDescription)}\n\n`;
        }
        if (event.fullDescription) {
            bodyText += `${escapeHTML(event.fullDescription)}`;
        }
        const imageUrl = sanitizeImageUrl(event.imageUrl || event.image);
        const isPhoto = !!imageUrl;
        const limit = isPhoto ? MAX_CAPTION_LENGTH : 4096;
        let text = titleText + bodyText;
        if (text.length > limit) {
            text =
                titleText + bodyText.substring(0, limit - titleText.length - 3) + "...";
        }
        const kb = new InlineKeyboard();
        const btnText = event.buttonText || "Register";
        const eventId = event._id || event.id;
        kb.text(btnText, `ev_reg_${eventId}`).row();
        if (validPage > 1) {
            kb.text("\u00AB Prev", `events_page_${validPage - 1}`);
        }
        if (hasMore) {
            kb.text("Next \u00BB", `events_page_${validPage + 1}`);
        }
        kb.row();
        kb.text("Home", "back_to_main");
        const isCallback = ctx.callbackQuery !== undefined;
        let msg;
        if (imageUrl) {
            if (isCallback) {
                try {
                    msg = await ctx.editMessageMedia({
                        type: "photo",
                        media: imageUrl,
                        caption: text,
                        parse_mode: "HTML",
                    }, { reply_markup: kb });
                    await ctx.answerCallbackQuery().catch(() => { });
                }
                catch (e: any) {
                    await deleteLastBotMessage(ctx);
                    msg = await ctx.replyWithPhoto(imageUrl, {
                        caption: text,
                        parse_mode: "HTML",
                        reply_markup: kb,
                    });
                    await ctx.answerCallbackQuery().catch(() => { });
                }
            }
            else {
                await deleteLastBotMessage(ctx);
                msg = await ctx.replyWithPhoto(imageUrl, {
                    caption: text,
                    parse_mode: "HTML",
                    reply_markup: kb,
                });
            }
        }
        else {
            if (isCallback) {
                try {
                    msg = await ctx.editMessageText(text, {
                        parse_mode: "HTML",
                        reply_markup: kb,
                    });
                    await ctx.answerCallbackQuery().catch(() => { });
                }
                catch (e: any) {
                    await deleteLastBotMessage(ctx);
                    msg = await ctx.reply(text, {
                        parse_mode: "HTML",
                        reply_markup: kb,
                    });
                    await ctx.answerCallbackQuery().catch(() => { });
                }
            }
            else {
                await deleteLastBotMessage(ctx);
                msg = await ctx.reply(text, {
                    parse_mode: "HTML",
                    reply_markup: kb,
                });
            }
        }
        if (msg && typeof msg !== "boolean") {
            ctx.session.lastBotMessageId = msg.message_id;
        }
    }
    catch (err: any) {
        console.error("Events List Error:", err);
        await editOrSend(ctx, "Failed to load events. Try again later.");
    }
}
export async function handleEventRegister(ctx: BotContext, eventId: string) {
    try {
        const s = ctx.session;
        if (!s.user || !s.token) {
            return ctx.answerCallbackQuery({
                text: "Please login first.",
                show_alert: true,
            });
        }
        await registerForEvent(s.token, {
            eventId,
        });
        await ctx.answerCallbackQuery({
            text: "Successfully registered!",
            show_alert: true,
        });
    }
    catch (err: any) {
        console.error("Registration Error:", err);
        const msg = err.response?.data?.message || err.message;
        await ctx.answerCallbackQuery({
            text: msg.includes("already registered")
                ? "You are already registered."
                : "Failed to register. Try again.",
            show_alert: true,
        });
    }
}
