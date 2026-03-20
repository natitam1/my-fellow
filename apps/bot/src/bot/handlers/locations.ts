import { BotContext } from "../context";
import { getAllLocations, getLocationById } from "../../api/locations";
import { InlineKeyboard } from "grammy";
export async function handleViewLocations(ctx: BotContext) {
  try {
    const result = await getAllLocations();
    const locations = Array.isArray(result)
      ? result
      : result.locations || result.data || [];
    if (!locations.length) {
      await ctx.reply("\uD83D\uDCCD No locations available.");
      return;
    }
    const kb = new InlineKeyboard();
    for (const loc of locations.slice(0, 10)) {
      kb.text(`📍 ${loc.name}`, `location_${loc._id}`).row();
    }
    kb.text("\uD83D\uDD19 Back to Menu", "back_to_menu");
    await ctx.reply("\uD83D\uDCCD *Our Locations*\n\nSelect a location:", {
      parse_mode: "Markdown",
      reply_markup: kb,
    });
  } catch (err: any) {
    await ctx.reply("\u274C Failed to load locations.");
  }
}
export async function handleLocationDetail(
  ctx: BotContext,
  locationId: string,
) {
  try {
    const result = await getLocationById(locationId);
    const loc = result.location || result;
    let text = `📍 *${loc.name}*\n\n`;
    if (loc.address) text += `🏠 Address: ${loc.address}\n`;
    if (loc.serviceTimes?.length)
      text += `⏰ Service Times: ${loc.serviceTimes.join(", ")}\n`;
    const kb = new InlineKeyboard();
    if (loc.googleMapsUrl) {
      kb.url("\uD83D\uDDFA Open in Google Maps", loc.googleMapsUrl).row();
    }
    kb.text("\uD83D\uDD19 Back to Locations", "view_locations");
    if (loc.image) {
      await ctx.replyWithPhoto(loc.image, {
        caption: text,
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } else {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
    }
  } catch {
    await ctx.reply("\u274C Could not load location details.");
  }
}
