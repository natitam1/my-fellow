import { BotContext } from "../../context";
import { adminEntityMenu, confirmDeleteKeyboard } from "../../keyboards";
import { editOrSend } from "../../message-manager";
import { getAdminEvents, createEvent, deleteEvent } from "../../../api/admin";

export async function handleAdminEventsMenu(ctx: BotContext) {
  ctx.session.adminForm = undefined;
  await editOrSend(ctx, "<b>Events Management</b>\n\nChoose an action:", {
    reply_markup: adminEntityMenu("events"),
  });
}

export async function handleAdminEventsList(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getAdminEvents(ctx.session.token);
    const events = result.data;

    let text = `<b>All Events</b> (${events.length})\n\n`;
    events.forEach((ev: any, i: number) => {
      text += `${i + 1}. <b>${ev.title}</b>\n`;
    });

    const kb: any[][] = [
      [{ text: "Add New", callback_data: "adm_events_add" }],
      [{ text: "Back", callback_data: "adm_events" }],
    ];
    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load events: ${err.message}`);
  }
}

const EVENT_STEPS = [
  "title",
  "shortDescription",
  "startDate",
  "endDate",
  "imageUrl",
];

export async function handleAdminEventCreate(ctx: BotContext) {
  ctx.session.adminForm = { entity: "events", step: "title", data: {} };
  await ctx.reply(
    "<b>Create Event</b>\n\nStep 1/5: Enter the event <b>title</b>:",
    { parse_mode: "HTML" },
  );
}

export async function handleAdminEventFormStep(
  ctx: BotContext,
  text: string,
): Promise<boolean> {
  const form = ctx.session.adminForm;
  if (!form || form.entity !== "events") return false;

  form.data[form.step] = text;

  const currentIdx = EVENT_STEPS.indexOf(form.step);
  const nextIdx = currentIdx + 1;

  if (nextIdx < EVENT_STEPS.length) {
    form.step = EVENT_STEPS[nextIdx];
    const prompts: Record<string, string> = {
      shortDescription: `Step 2/5: Enter a <b>short description</b>:`,
      startDate: `Step 3/5: Enter the <b>start date</b> (YYYY-MM-DD):`,
      endDate: `Step 4/5: Enter the <b>end date</b> (YYYY-MM-DD):`,
      imageUrl: `Step 5/5: Enter the <b>image URL</b> (or type "skip"):`,
    };
    await ctx.reply(prompts[form.step], { parse_mode: "HTML" });
    return true;
  }

  if (!ctx.session.token) return false;
  try {
    const body: any = {
      title: form.data.title,
      shortDescription: form.data.shortDescription,
      startDate: form.data.startDate,
      endDate: form.data.endDate,
    };
    if (form.data.imageUrl && form.data.imageUrl !== "skip") {
      body.imageUrl = form.data.imageUrl;
    }
    await createEvent(ctx.session.token, body);
    ctx.session.adminForm = undefined;
    await ctx.reply("Event created successfully!", { parse_mode: "HTML" });
    return true;
  } catch (err: any) {
    ctx.session.adminForm = undefined;
    await ctx.reply(
      `Failed to create event: ${err.response?.data?.message || err.message}`,
    );
    return true;
  }
}

export async function handleAdminEventDelete(ctx: BotContext, id: string) {
  if (!ctx.session.token) return;
  try {
    await deleteEvent(ctx.session.token, id);
    await ctx.reply("Event deleted.");
  } catch (err: any) {
    await ctx.reply(
      `Failed to delete: ${err.response?.data?.message || err.message}`,
    );
  }
}
