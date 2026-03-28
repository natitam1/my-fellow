import { BotContext } from "../../context";
import { adminEntityMenu } from "../../keyboards";
import { editOrSend } from "../../message-manager";
import {
  getLocations,
  createLocation,
  deleteLocation,
} from "../../../api/admin";

export async function handleAdminLocationsMenu(ctx: BotContext) {
  ctx.session.adminForm = undefined;
  await editOrSend(ctx, "<b>Locations Management</b>\n\nChoose an action:", {
    reply_markup: adminEntityMenu("locations"),
  });
}

export async function handleAdminLocationsList(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getLocations(ctx.session.token);
    const locations = result.data;

    let text = `<b>Locations</b> (${locations.length})\n\n`;
    locations.forEach((l: any, i: number) => {
      text += `${i + 1}. <b>${l.name}</b> — ${l.address}\n`;
      text += `   /adm_locations_del_${l._id}\n`;
    });

    const kb: any[][] = [
      [{ text: "Add New", callback_data: "adm_locations_add" }],
      [{ text: "Back", callback_data: "adm_locations" }],
    ];
    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load locations: ${err.message}`);
  }
}

const LOCATION_STEPS = ["name", "address", "googleMapsUrl", "serviceTimes"];

export async function handleAdminLocationCreate(ctx: BotContext) {
  ctx.session.adminForm = { entity: "locations", step: "name", data: {} };
  await ctx.reply(
    "<b>Create Location</b>\n\nStep 1/4: Enter the location <b>name</b>:",
    { parse_mode: "HTML" },
  );
}

export async function handleAdminLocationFormStep(
  ctx: BotContext,
  text: string,
): Promise<boolean> {
  const form = ctx.session.adminForm;
  if (!form || form.entity !== "locations") return false;

  form.data[form.step] = text;
  const currentIdx = LOCATION_STEPS.indexOf(form.step);
  const nextIdx = currentIdx + 1;

  if (nextIdx < LOCATION_STEPS.length) {
    form.step = LOCATION_STEPS[nextIdx];
    const prompts: Record<string, string> = {
      address: `Step 2/4: Enter the <b>address</b>:`,
      googleMapsUrl: `Step 3/4: Enter the <b>Google Maps URL</b>:`,
      serviceTimes: `Step 4/4: Enter <b>service times</b> (comma-separated, e.g. "Sun 10AM, Wed 6PM"):`,
    };
    await ctx.reply(prompts[form.step], { parse_mode: "HTML" });
    return true;
  }

  if (!ctx.session.token) return false;
  try {
    const body = {
      name: form.data.name,
      address: form.data.address,
      googleMapsUrl: form.data.googleMapsUrl,
      serviceTimes: form.data.serviceTimes
        .split(",")
        .map((s: string) => s.trim()),
      coordinates: { latitude: 9.0054, longitude: 38.7636 },
    };
    await createLocation(ctx.session.token, body);
    ctx.session.adminForm = undefined;
    await ctx.reply("Location created successfully!");
    return true;
  } catch (err: any) {
    ctx.session.adminForm = undefined;
    await ctx.reply(
      `Failed to create location: ${err.response?.data?.message || err.message}`,
    );
    return true;
  }
}

export async function handleAdminLocationDelete(ctx: BotContext, id: string) {
  if (!ctx.session.token) return;
  try {
    await deleteLocation(ctx.session.token, id);
    await ctx.reply("Location deleted.");
  } catch (err: any) {
    await ctx.reply(
      `Failed to delete: ${err.response?.data?.message || err.message}`,
    );
  }
}
