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
  "imageUrl",
  "title",
  "shortDescription",
  "fullDescription",
  "startDate",
  "endDate",
  "buttonText",
  "registrationLimit",
  "scheduledAt",
];

export async function handleAdminEventCreate(ctx: BotContext) {
  ctx.session.adminForm = { entity: "events", step: "imageUrl", data: {} };
  await ctx.reply(
    "<b>Create Event</b>\n\nStep 1/9: Upload a <b>Banner Image</b> (or send an image URL, or type 'skip'):",
    { parse_mode: "HTML" },
  );
}

export async function handleAdminEventFormStep(
  ctx: BotContext,
  text: string,
  photoBuffer?: Buffer,
): Promise<boolean> {
  const form = ctx.session.adminForm;
  if (!form || form.entity !== "events") return false;

  if (form.step === "imageUrl" && photoBuffer) {
    form.data.imageBuffer = photoBuffer;
  } else {
    form.data[form.step] = text;
  }

  const currentIdx = EVENT_STEPS.indexOf(form.step);
  const nextIdx = currentIdx + 1;

  if (nextIdx < EVENT_STEPS.length) {
    form.step = EVENT_STEPS[nextIdx];
    const totalSteps = EVENT_STEPS.length;
    const prompts: Record<string, string> = {
      title: `Step 2/${totalSteps}: Enter the event <b>title</b>:`,
      shortDescription: `Step 3/${totalSteps}: Enter a <b>short description</b>:`,
      fullDescription: `Step 4/${totalSteps}: Enter a <b>full description</b> (optional, or type 'skip'):`,
      startDate: `Step 5/${totalSteps}: Enter the <b>start date & time</b> (e.g. YYYY-MM-DD HH:MM):`,
      endDate: `Step 6/${totalSteps}: Enter the <b>end date & time</b> (e.g. YYYY-MM-DD HH:MM):`,
      buttonText: `Step 7/${totalSteps}: Enter the <b>button text/CTA</b> (e.g. "Register Now"):`,
      registrationLimit: `Step 8/${totalSteps}: Enter the <b>registration limit</b> (optional, or type 'skip'):`,
      scheduledAt: `Step 9/${totalSteps}: Enter the <b>scheduled posting time</b> (e.g. YYYY-MM-DD HH:MM, or type 'skip'):`,
    };
    await ctx.reply(prompts[form.step], { parse_mode: "HTML" });
    return true;
  }

  if (!ctx.session.token) return false;
  try {
    const d = form.data;
    const isSkip = (val: any) =>
      typeof val === "string" && val.toLowerCase() === "skip";

    const body: any = {
      title: d.title,
      shortDescription: d.shortDescription,
      fullDescription: !isSkip(d.fullDescription)
        ? d.fullDescription
        : undefined,
      startDate: d.startDate,
      endDate: d.endDate,
      buttonText: d.buttonText,
      registrationLimit: !isSkip(d.registrationLimit)
        ? Number(d.registrationLimit)
        : undefined,
      scheduledAt: !isSkip(d.scheduledAt) ? d.scheduledAt : undefined,
    };
    if (form.data.imageBuffer) {
      body.imageBuffer = form.data.imageBuffer;
    } else if (form.data.imageUrl && !isSkip(form.data.imageUrl)) {
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
