import { BotContext } from "../context";
import { getAllEvents, registerForEvent } from "../../api/events";
import { deleteLastBotMessage, editOrSend } from "../message-manager";
import { InlineKeyboard } from "grammy";

const PAGE_SIZE = 1;

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

    let text = `*${event.title}*\n\n`;
    if (event.shortDescription) {
      text += `${event.shortDescription}\n\n`;
    }
    if (event.fullDescription) {
      text += `${event.fullDescription}`;
    }

    const kb = new InlineKeyboard();

    const btnText = event.buttonText || "Register";
    kb.text(btnText, `ev_reg_${event._id}`).row();

    if (validPage > 1) {
      kb.text("« Prev", `events_page_${validPage - 1}`);
    }
    if (hasMore) {
      kb.text("Next »", `events_page_${validPage + 1}`);
    }
    kb.row();
    kb.text("Home", "fi_menu");

    await deleteLastBotMessage(ctx);

    let msg;
    if (event.imageUrl) {
      try {
        msg = await ctx.replyWithPhoto(event.imageUrl, {
          caption: text,
          parse_mode: "Markdown",
          reply_markup: kb,
        });
      } catch (e) {
        msg = await ctx.reply(text, {
          parse_mode: "Markdown",
          reply_markup: kb,
        });
      }
    } else {
      msg = await ctx.reply(text, {
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    }

    ctx.session.lastBotMessageId = msg?.message_id;
  } catch (err: any) {
    console.error(err);
    await editOrSend(ctx, "Failed to load events. Try again later.");
  }
}

export async function handleEventRegister(ctx: BotContext, eventId: string) {
  try {
    const s = ctx.session;
    if (!s.user) {
      return ctx.answerCallbackQuery("Please login first.");
    }

    const result = await getAllEvents();
    const allEvents = Array.isArray(result)
      ? result
      : result.events || result.data || [];
    const event = allEvents.find(
      (e: any) => e._id === eventId || e.id === eventId,
    );

    if (!event) {
      return ctx.answerCallbackQuery("Event not found.");
    }

    await registerForEvent({
      fullName: s.user.fullName || "Unknown",
      phoneNumber: s.user.phoneNumber || "Unknown",
      team: "N/A",
      department: "N/A",
      yearOfStudy: "N/A",
      telegramUserName: ctx.from?.username || "N/A",
      eventTitle: event.title,
    });

    await ctx.answerCallbackQuery({
      text: "Successfully registered!",
      show_alert: true,
    });
  } catch (err: any) {
    console.error(err);
    await ctx.answerCallbackQuery({
      text: "Failed to register. You might be already registered.",
      show_alert: true,
    });
  }
}
