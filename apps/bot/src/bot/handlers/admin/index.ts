import { BotContext } from "../../context";
import { adminInlineMenu } from "../../keyboards";
import { editOrSend } from "../../message-manager";
import { getAdminStats, getAdminUsers } from "../../../api/admin";
import { handleAdminEventFormStep as _eventForm } from "./events";
import { handleAdminDevotionFormStep as _devotionForm } from "./devotions";
import { handleAdminLeaderFormStep as _leaderForm } from "./leaders";
import { handleAdminProgramFormStep as _programForm } from "./programs";
import { handleAdminTeamFormStep as _teamForm } from "./teams";
import { handleAdminLocationFormStep as _locationForm } from "./locations";

export {
  handleAdminEventsList,
  handleAdminEventsMenu,
  handleAdminEventCreate,
  handleAdminEventDelete,
  handleAdminEventFormStep,
} from "./events";
export {
  handleAdminDevotionsList,
  handleAdminDevotionsMenu,
  handleAdminDevotionCreate,
  handleAdminDevotionDelete,
  handleAdminDevotionFormStep,
} from "./devotions";
export {
  handleAdminLeadersList,
  handleAdminLeadersMenu,
  handleAdminLeaderCreate,
  handleAdminLeaderDelete,
  handleAdminLeaderFormStep,
} from "./leaders";
export {
  handleAdminProgramsList,
  handleAdminProgramsMenu,
  handleAdminProgramCreate,
  handleAdminProgramDelete,
  handleAdminProgramFormStep,
} from "./programs";
export {
  handleAdminTeamsList,
  handleAdminTeamsMenu,
  handleAdminTeamCreate,
  handleAdminTeamDelete,
  handleAdminTeamFormStep,
} from "./teams";
export {
  handleAdminLocationsList,
  handleAdminLocationsMenu,
  handleAdminLocationCreate,
  handleAdminLocationDelete,
  handleAdminLocationFormStep,
} from "./locations";
export { handleAdminRegistrationsList } from "./registrations";
export { handleAdminTransactionsList } from "./transactions";
export { handleAdminOrdersList, handleAdminOrderStatus } from "./orders";
export {
  handleAdminJoinRequestsList,
  handleAdminJoinRequestStatus,
} from "./join-requests";

export async function handleAdminMenu(ctx: BotContext) {
  if (ctx.session.user?.role !== "admin") {
    return ctx.reply("You do not have permission to access the admin menu.");
  }
  ctx.session.adminForm = undefined;
  ctx.session.adminPendingDelete = undefined;
  await editOrSend(
    ctx,
    "<b>Admin Dashboard</b>\n\nSelect a section to manage:",
    { reply_markup: adminInlineMenu() },
  );
}

export async function handleAdminStats(ctx: BotContext) {
  if (!ctx.session.token) return;
  try {
    const result = await getAdminStats(ctx.session.token);
    const s = result.data;
    const text =
      `<b>Fellowship Statistics</b>\n\n` +
      `Users: <b>${s.users}</b>\n` +
      `Events: <b>${s.events}</b>\n` +
      `Registrations: <b>${s.registrations}</b>\n` +
      `Transactions: <b>${s.transactions}</b>\n` +
      `Revenue: <b>${s.totalRevenue} ETB</b>`;
    await editOrSend(ctx, text, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "adm_menu" }]],
      },
    });
  } catch (err: any) {
    await ctx.reply(`Failed to load stats: ${err.message}`);
  }
}

export async function handleAdminUsersList(ctx: BotContext) {
  if (!ctx.session.token) return;
  const page = ctx.session.currentPage || 1;
  try {
    const result = await getAdminUsers(ctx.session.token, page);
    const users = result.data;
    const { total, totalPages } = result.pagination;

    let text = `<b>Users</b> (${total} total, page ${page}/${totalPages})\n\n`;
    users.forEach((u: any, i: number) => {
      const tgUsername = u.telegramUserName || u.telegramUsername;
      const tg = tgUsername ? `@${tgUsername}` : "N/A";
      text += `${(page - 1) * 10 + i + 1}. <b>${u.fullName}</b>\n   ${u.phoneNumber} | ${tg}\n`;
    });

    const kb: any[][] = [];
    const nav: any[] = [];
    if (page > 1)
      nav.push({
        text: "Prev",
        callback_data: `adm_users_page_${page - 1}`,
      });
    if (page < totalPages)
      nav.push({
        text: "Next",
        callback_data: `adm_users_page_${page + 1}`,
      });
    if (nav.length) kb.push(nav);
    kb.push([{ text: "Back", callback_data: "adm_menu" }]);

    await editOrSend(ctx, text, { reply_markup: { inline_keyboard: kb } });
  } catch (err: any) {
    await ctx.reply(`Failed to load users: ${err.message}`);
  }
}

export function isAdminFormActive(ctx: BotContext): boolean {
  return !!ctx.session.adminForm;
}

export async function handleAdminFormInput(
  ctx: BotContext,
  text: string,
  photoBuffer?: Buffer,
): Promise<boolean> {
  const form = ctx.session.adminForm;
  if (!form) return false;

  switch (form.entity) {
    case "events":
      return _eventForm(ctx, text, photoBuffer);
    case "devotions":
      return _devotionForm(ctx, text);
    case "leaders":
      return _leaderForm(ctx, text);
    case "programs":
      return _programForm(ctx, text);
    case "teams":
      return _teamForm(ctx, text);
    case "locations":
      return _locationForm(ctx, text);
    default:
      ctx.session.adminForm = undefined;
      return false;
  }
}
