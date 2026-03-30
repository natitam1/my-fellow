import { BotContext } from "../context";
import { getAllLocations } from "../../api/locations";
import { editOrSend } from "../message-manager";
import { buildPaginationKeyboard } from "../keyboards";
import { InlineKeyboard } from "grammy";
const PAGE_SIZE = 5;
export async function handleLocationsList(ctx: BotContext) {
  ctx.session.currentSection = "locations";
  const page = ctx.session.currentPage || 1;
  const result = await getAllLocations();
  const allLocations = Array.isArray(result)
    ? result
    : result.locations || result.data || [];
  if (!allLocations.length) return editOrSend(ctx, "No locations found.");
  const start = (page - 1) * PAGE_SIZE;
  const pagedLocations = allLocations.slice(start, start + PAGE_SIZE);
  const hasMore = allLocations.length > start + PAGE_SIZE;
  let text = `<b>Locations</b>\n\nPage ${page} of ${Math.ceil(allLocations.length / PAGE_SIZE)}\n\nExplore our fellowship locations:\n\n`;
  const kb = buildPaginationKeyboard("locations", page, hasMore);
  pagedLocations.forEach((loc: any, index: number) => {
    const num = (page - 1) * PAGE_SIZE + index + 1;
    text += `${num}. <b>${loc.name}</b>\n`;
    if (loc.address) text += `📍 Address: ${loc.address}\n`;
    if (loc.serviceTimes?.length)
      text += `🕐 Service Times: ${loc.serviceTimes.join(", ")}\n`;
    if (loc.googleMapsUrl)
      text += `🗺️ <a href="${loc.googleMapsUrl}">View on Map</a>\n`;
    else if (loc.coordinates?.latitude && loc.coordinates?.longitude)
      text += `🗺️ <a href="https://www.google.com/maps/search/?api=1&query=${loc.coordinates.latitude},${loc.coordinates.longitude}">View on Map</a>\n`;
    text += `\n`;
  });
  await editOrSend(ctx, text.trimEnd(), {
    parse_mode: "HTML",
    reply_markup: kb,
  });
}
