import { BotContext } from "../context";
import { editOrSend } from "../message-manager";

export async function handleHome(ctx: BotContext) {
  ctx.session.state = "BROWSING";
  
  const text = `Home Page

Welcome to My Fellow. Use the bottom keyboard and inline buttons to browse our community resources.

Latest updates on:
- Events
- Devotions
- Marketplace
- And more!`;

  await editOrSend(ctx, text);
}
