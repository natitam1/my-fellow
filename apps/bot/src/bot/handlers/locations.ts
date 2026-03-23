import { BotContext } from "../context";
import { getAllLocations, getLocationById } from "../../api/locations";
import { editOrSend } from "../message-manager";
import { buildPaginationKeyboard } from "../keyboards";
import { InlineKeyboard } from "grammy";

const PAGE_SIZE = 5;

export async function handleLocationsList(ctx: BotContext) {
  ctx.session.currentSection = "locations";
  const page = ctx.session.currentPage || 1;
  const result = await getAllLocations();
  const allLocations = Array.isArray(result) ? result : result.locations || result.data || [];
  
  if (!allLocations.length) return editOrSend(ctx, "No locations found.");
  
  const start = (page - 1) * PAGE_SIZE;
  const pagedLocations = allLocations.slice(start, start + PAGE_SIZE);
  const hasMore = allLocations.length > start + PAGE_SIZE;

  let text = `Locations\n\nPage ${page} of ${Math.ceil(allLocations.length / PAGE_SIZE)}\n\nFind our fellowships near you:\n\n`;
  const kb = buildPaginationKeyboard("locations", page, hasMore, "fi_menu");
  
  for (const loc of pagedLocations) {
    kb.text(loc.name, `location_view_${loc._id}`).row();
  }
  
  await editOrSend(ctx, text, { reply_markup: kb });
}

export async function handleLocationDetail(ctx: BotContext, id: string) {
  try {
    const result = await getLocationById(id);
    const loc = result.location || result;
    const text = `Location Detail\n\nName: ${loc.name}\nAddress: ${loc.address || "N/A"}\nService Times: ${loc.serviceTimes?.join(", ") || "N/A"}`;
    
    const kb = new InlineKeyboard();
    if (loc.googleMapsUrl) {
      kb.url("Open in Maps", loc.googleMapsUrl).row();
    }
    kb.text("Back", "fi_locations");
      
    await editOrSend(ctx, text, { reply_markup: kb });
  } catch {
    await editOrSend(ctx, "Could not load location detail.");
  }
}
