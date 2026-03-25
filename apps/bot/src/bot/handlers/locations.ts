import { BotContext } from "../context";
import { getAllLocations, getLocationById } from "../../api/locations";
import { editOrSend, deleteLastBotMessage } from "../message-manager";
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

  let text = `Locations\n\nPage ${page} of ${Math.ceil(allLocations.length / PAGE_SIZE)}\n\nTap a location to view it on the map:\n\n`;
  const kb = buildPaginationKeyboard("locations", page, hasMore);

  pagedLocations.forEach((loc: any, index: number) => {
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
    kb.text(`${emojis[index]} ${loc.name}`, `location_view_${loc._id}`).row();
  });

  kb.row().url(
    "🗺 Interactive Map",
    "https://www.google.com/maps/search/AAU+4-Killo+Evangelical+Christian+Students+Fellowship",
  );

  await editOrSend(ctx, text, { reply_markup: kb });
}

export async function handleLocationDetail(ctx: BotContext, id: string) {
  try {
    const result = await getLocationById(id);
    const loc = result.location || result;

    const hasCoords =
      loc.coordinates && loc.coordinates.latitude && loc.coordinates.longitude;

    if (hasCoords) {
      await deleteLastBotMessage(ctx);
      const msg = await ctx.replyWithVenue(
        loc.coordinates.latitude,
        loc.coordinates.longitude,
        loc.name,
        loc.address || "Addis Ababa",
      );
      ctx.session.lastBotMessageId = msg.message_id;

      let caption = `<b>${loc.name}</b>\n📍 ${loc.address || "N/A"}`;
      if (loc.serviceTimes?.length) {
        caption += `\n\n🕐 <b>Service Times:</b>\n${loc.serviceTimes.map((t: string) => `• ${t}`).join("\n")}`;
      }

      const detailKb = new InlineKeyboard();
      if (loc.googleMapsUrl) {
        detailKb.url("Open in Google Maps", loc.googleMapsUrl).row();
      }
      detailKb.text("Back", "fi_locations");

      await ctx.reply(caption, {
        parse_mode: "HTML",
        reply_markup: detailKb,
      });
    } else {
      let text = `<b>${loc.name}</b>\n📍 ${loc.address || "N/A"}`;
      if (loc.serviceTimes?.length) {
        text += `\n\n🕐 <b>Service Times:</b>\n${loc.serviceTimes.map((t: string) => `• ${t}`).join("\n")}`;
      }

      const kb = new InlineKeyboard();
      if (loc.googleMapsUrl) {
        kb.url("Open in Google Maps", loc.googleMapsUrl).row();
      }
      kb.text("Back", "fi_locations");

      await editOrSend(ctx, text, { parse_mode: "HTML", reply_markup: kb });
    }
  } catch {
    await editOrSend(ctx, "Could not load location detail.");
  }
}
