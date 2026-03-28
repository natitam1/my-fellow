import { InlineKeyboard } from "grammy";
import { BotContext } from "../context";
export async function sendMainMenu(ctx: BotContext) {
    const isLoggedIn = !!ctx.session.token;
    const text = "\uD83C\uDFE0 *Main Menu*\n\n" +
        "Welcome to My Fellow Bot! Choose an option below:";
    const kb = new InlineKeyboard()
        .text("\uD83D\uDCC5 Events", "view_events")
        .text("\uD83D\uDCD6 Devotions", "view_devotions")
        .row()
        .text("\uD83D\uDC65 Teams", "view_teams")
        .text("\uD83D\uDCC6 Programs", "view_programs")
        .row()
        .text("\uD83D\uDCCD Locations", "view_locations")
        .text("\uD83D\uDC64 Leaders", "view_leaders")
        .row();
    if (isLoggedIn) {
        kb.text("\uD83D\uDCB8 Contribute", "start_payment").row();
    }
    kb.text("\u2139\uFE0F About", "about").text("\u2699\uFE0F Settings", "settings");
    await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
}
