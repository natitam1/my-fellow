import { BotContext } from "../context";
import { editOrSend } from "../message-manager";
import { fellowInfoInlineMenu } from "../keyboards";

export async function handleFellowInfo(ctx: BotContext) {
  ctx.session.state = "BROWSING";
  ctx.session.currentSection = "fellow_info";

  const text = `Fellow Info

Explore our community resources using the buttons below:
Leaders - View our leadership team
Teams - Join ministry and interest groups
Programs - See weekly schedules
Locations - Find us near you
Devotions - Read or listen to daily inspirations
Marketplace - Buy our products
Events - Join upcoming activities`;

  await editOrSend(ctx, text, { reply_markup: fellowInfoInlineMenu() });
}
