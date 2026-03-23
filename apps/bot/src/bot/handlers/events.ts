import { BotContext } from "../context";
import { getAllEvents, getEventById } from "../../api/events";
import { editOrSend } from "../message-manager";
import { buildPaginationKeyboard } from "../keyboards";
import { InlineKeyboard } from "grammy";

const PAGE_SIZE = 5;

export async function handleEventsList(ctx: BotContext) {
  ctx.session.currentSection = "events";
  const page = ctx.session.currentPage || 1;
  
  try {
    const result = await getAllEvents();
    const allEvents = Array.isArray(result) ? result : result.events || result.data || [];
    
    if (!allEvents.length) {
      return editOrSend(ctx, "No events available at this time.");
    }

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pagedEvents = allEvents.slice(start, end);
    const hasMore = allEvents.length > end;

    let text = `Events\n\nPage ${page} of ${Math.ceil(allEvents.length / PAGE_SIZE)}\n\nSelect an event for more detail:\n\n`;
    
    const kb = buildPaginationKeyboard("events", page, hasMore, "fi_menu");
    
    for (const event of pagedEvents) {
      kb.text(event.title, `event_view_${event._id}`).row();
    }

    await editOrSend(ctx, text, { reply_markup: kb });
  } catch (err: any) {
    await editOrSend(ctx, "Failed to load events. Try again later.");
  }
}

export async function handleEventDetail(ctx: BotContext, eventId: string) {
  try {
    const result = await getEventById(eventId);
    const event = result.event || result;
    
    const dateStr = new Date(event.startDate).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const text = `Event Detail\n\nTitle: ${event.title}\nDate: ${dateStr}\n\nDescription: ${event.shortDescription || ""}\n\n${event.fullDescription || ""}`;

    const kb = new InlineKeyboard()
      .text("Back", "fi_events");

    await editOrSend(ctx, text, { reply_markup: kb });
  } catch (err: any) {
    await editOrSend(ctx, "Error loading event detail.");
  }
}
