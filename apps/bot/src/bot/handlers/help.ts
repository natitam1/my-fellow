import { BotContext } from "../context";
import { editOrSend, deleteLastBotMessage } from "../message-manager";
export async function handleHelp(ctx: BotContext) {
    const text = `Help Center

For support, contact admin: @admin_username

How to use:
- Home: Main dashboard and latest news
- Fellow Info: Browse community resources (Events, Teams, etc.)
- My Profile: Manage your account, orders and join requests
- Payments: Make contributions and view giving history
- Logout: Sign out from the bot sessions`;
    await editOrSend(ctx, text);
}
