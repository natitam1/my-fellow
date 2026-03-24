import { BotContext } from "../context";
import { getAllEvents, registerForEvent } from "../../api/events";
import { deleteLastBotMessage, editOrSend } from "../message-manager";
import { InlineKeyboard } from "grammy";

const MAX_CAPTION_LENGTH = 1024;

function escapeHTML(str: string) {
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m] || m,
  );
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
    if (page > allEvents.length) validPage = allEvents.length;
    if (page < 1) validPage = 1;

    const event = allEvents[validPage - 1];
    if (!event) return;

    const hasMore = validPage < allEvents.length;

    let titleText = `<b>${escapeHTML(event.title)}</b>\n\n`;
    let bodyText = "";
    if (event.shortDescription) {
      bodyText += `${escapeHTML(event.shortDescription)}\n\n`;
    }
    if (event.fullDescription) {
      bodyText += `${escapeHTML(event.fullDescription)}`;
    }

    // Handle Telegram caption limit (1024 characters for photos, 4096 for text)
    const isPhoto = !!event.imageUrl;
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
      kb.text("« Prev", `events_page_${validPage - 1}`);
    }
    if (hasMore) {
      kb.text("Next »", `events_page_${validPage + 1}`);
    }
    kb.row();
    kb.text("Home", "fi_menu");

    const isCallback = ctx.callbackQuery !== undefined;

    let msg;
    if (event.imageUrl) {
      if (isCallback) {
        try {
          // If previous message was also media, we can edit
          msg = await ctx.editMessageMedia(
            {
              type: "photo",
              media: event.imageUrl,
              caption: text,
              parse_mode: "HTML",
            },
            { reply_markup: kb },
          );
          await ctx.answerCallbackQuery().catch(() => {});
        } catch (e: any) {
          // If conversion text -> media failed, delete and re-send
          await deleteLastBotMessage(ctx);
          msg = await ctx.replyWithPhoto(event.imageUrl, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: kb,
          });
          await ctx.answerCallbackQuery().catch(() => {});
        }
      } else {
        await deleteLastBotMessage(ctx);
        msg = await ctx.replyWithPhoto(event.imageUrl, {
          caption: text,
          parse_mode: "HTML",
          reply_markup: kb,
        });
      }
    } else {
      if (isCallback) {
        try {
          // If previous message was media, editMessageText will FAIL
          msg = await ctx.editMessageText(text, {
            parse_mode: "HTML",
            reply_markup: kb,
          });
          await ctx.answerCallbackQuery().catch(() => {});
        } catch (e: any) {
          await deleteLastBotMessage(ctx);
          msg = await ctx.reply(text, {
            parse_mode: "HTML",
            reply_markup: kb,
          });
          await ctx.answerCallbackQuery().catch(() => {});
        }
      } else {
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
  } catch (err: any) {
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

    // Send only eventId as the backend controller expects
    await registerForEvent({
      eventId,
    } as any);

    await ctx.answerCallbackQuery({
      text: "Successfully registered!",
      show_alert: true,
    });
  } catch (err: any) {
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
