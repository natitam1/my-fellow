import { BotContext } from "../context";
import { getAllEvents, getEventById, registerForEvent } from "../../api/events";
import { InlineKeyboard } from "grammy";

/**
 * Show a paginated list of upcoming events as inline buttons.
 */
export async function handleViewEvents(ctx: BotContext) {
  try {
    const result = await getAllEvents();
    const events = Array.isArray(result)
      ? result
      : result.events || result.data || [];

    if (!events.length) {
      await ctx.reply("📅 No upcoming events at the moment. Check back later!");
      return;
    }

    const kb = new InlineKeyboard();
    for (const event of events.slice(0, 10)) {
      kb.text(event.title, `event_${event._id}`).row();
    }
    kb.text("🔙 Back to Menu", "back_to_menu");

    await ctx.reply(
      "📅 *Upcoming Events*\n\nSelect an event to view details:",
      {
        parse_mode: "Markdown",
        reply_markup: kb,
      },
    );
  } catch (err: any) {
    await ctx.reply("❌ Failed to load events. Please try again later.");
    console.error("handleViewEvents error:", err.message);
  }
}

/**
 * Show full details of a single event.
 */
export async function handleEventDetail(ctx: BotContext, eventId: string) {
  try {
    const result = await getEventById(eventId);
    const event = result.event || result;

    const startDate = new Date(event.startDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let text = `📅 *${event.title}*\n\n`;
    text += `📝 ${event.shortDescription || ""}\n\n`;
    if (event.fullDescription) text += `${event.fullDescription}\n\n`;
    text += `🗓 *Date:* ${startDate}\n`;

    const kb = new InlineKeyboard()
      .text(
        "✅ Register for this Event",
        `register_event_${event._id}_${event.title}`,
      )
      .row()
      .text("🔙 Back to Events", "view_events");

    if (event.image) {
      await ctx.replyWithPhoto(event.image, {
        caption: text,
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } else {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
    }
  } catch (err: any) {
    await ctx.reply("❌ Could not load event details.");
    console.error("handleEventDetail error:", err.message);
  }
}

/**
 * Start the event registration process — collects data step by step via callback.
 */
export async function handleEventRegistration(
  ctx: BotContext,
  eventTitle: string,
) {
  // We'll store partial registration data on the session
  const username = ctx.from?.username ? `@${ctx.from.username}` : "";

  await ctx.reply(
    `✅ *Registering for: ${eventTitle}*\n\n` +
      "Please send your details in the following format (each on a new line):\n\n" +
      "Full Name\n" +
      "Phone Number\n" +
      "Team (e.g. Worship, Outreach)\n" +
      "Department\n" +
      "Year of Study",
    { parse_mode: "Markdown" },
  );

  // The main index.ts will listen for the next text message
  // and call completeEventRegistration
  (ctx.session as any).__pendingEventReg = { eventTitle, username };
}

/**
 * Complete the registration after receiving the user's text.
 */
export async function completeEventRegistration(ctx: BotContext, text: string) {
  const pending = (ctx.session as any).__pendingEventReg;
  if (!pending) return false;

  const lines = text.split("\n").map((l) => l.trim());
  if (lines.length < 5) {
    await ctx.reply(
      "⚠️ Please provide all 5 lines:\nFull Name\nPhone Number\nTeam\nDepartment\nYear of Study",
    );
    return true; // consumed, but need retry
  }

  try {
    await registerForEvent({
      fullName: lines[0],
      phoneNumber: lines[1],
      team: lines[2],
      department: lines[3],
      yearOfStudy: lines[4],
      telegramUserName: pending.username,
      eventTitle: pending.eventTitle,
    });
    await ctx.reply(
      `🎉 *Registration Successful!*\n\nYou are registered for *${pending.eventTitle}*.`,
      { parse_mode: "Markdown" },
    );
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    await ctx.reply(`❌ Registration failed: ${msg}`);
  }

  delete (ctx.session as any).__pendingEventReg;
  return true;
}
