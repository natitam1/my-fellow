import { BotContext } from "../context";
import { getAllTeams, createJoinRequest } from "../../api/teams";
import { editOrSend } from "../message-manager";
import { InlineKeyboard } from "grammy";
const MAX_CAPTION_LENGTH = 1024;
function escapeHTML(str: string) {
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m] || m,
  );
}
function sanitizeImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.toLowerCase().endsWith(".avif")) {
    if (url.includes("cloudinary.com")) {
      return url
        .replace(/\/upload\/(v\d+)/, "/upload/f_jpg/$1")
        .replace(/\.avif$/i, ".jpg");
    }
    return undefined;
  }
  return url;
}
export async function handleTeamsList(ctx: BotContext) {
  ctx.session.currentSection = "teams";
  const page = ctx.session.currentPage || 1;
  try {
    const result = await getAllTeams();
    const allTeams = Array.isArray(result)
      ? result
      : result.teams || result.data || [];
    if (!allTeams.length) {
      return editOrSend(ctx, "No teams available at this time.");
    }
    let validPage = page;
    if (page > allTeams.length) validPage = allTeams.length;
    if (page < 1) validPage = 1;
    const team = allTeams[validPage - 1];
    if (!team) return;
    const hasMore = validPage < allTeams.length;
    let titleText = `<b>${escapeHTML(team.name)}</b>\n`;
    if (team.members) {
      titleText += `${team.members} Members\n`;
    }
    titleText += `\n`;
    const imageUrl = sanitizeImageUrl(team.imageUrl);
    const isPhoto = !!imageUrl;
    const limit = isPhoto ? MAX_CAPTION_LENGTH : 4096;
    let remaining = limit - titleText.length;
    let metadataText = "";
    if (team.meetingDay) {
      metadataText += `Day: ${escapeHTML(team.meetingDay)}\n`;
    }
    if (team.time) {
      metadataText += `Time: ${escapeHTML(team.time)}\n`;
    }
    if (team.location) {
      if (team.coordinates?.lat && team.coordinates?.lng) {
        metadataText += `Location: <a href="https://www.google.com/maps/search/?api=1&query=${team.coordinates.lat},${team.coordinates.lng}">${escapeHTML(team.location)}</a>\n`;
      } else {
        metadataText += `Location: ${escapeHTML(team.location)}\n`;
      }
    }
    if (team.leader?.name) {
      let leaderLine = `Leader: <b>${escapeHTML(team.leader.name)}</b>`;
      if (team.leader.role) leaderLine += ` (${escapeHTML(team.leader.role)})`;
      if (team.leader.telegram) {
        const handle = team.leader.telegram.replace("@", "");
        leaderLine += ` — <a href="https://t.me/${handle}">@${handle}</a>`;
      }
      if (team.leader.phoneNumber || team.leader.phone) {
        const phone = team.leader.phoneNumber || team.leader.phone;
        leaderLine += `\nPhone: <code>${escapeHTML(phone)}</code>`;
      }
      metadataText += `\n${leaderLine}\n`;
    }
    remaining -= metadataText.length;
    let bodyText = "";
    let desc = "";
    if (team.description) desc += team.description + "\n\n";
    if (team.about) desc += team.about + "\n\n";
    if (desc.length > remaining) {
      desc = desc.substring(0, remaining - 3) + "...";
    }
    if (desc) {
      bodyText += escapeHTML(desc) + "\n";
    }
    const text = titleText + bodyText + metadataText;
    const kb = new InlineKeyboard();
    if (team.leader?.telegram) {
      const handle = team.leader.telegram.replace("@", "");
      kb.url("Contact Leader", `https://t.me/${handle}`).row();
    }
    if (validPage > 1) {
      kb.text("\u00AB Prev", `teams_page_${validPage - 1}`);
    }
    if (hasMore) {
      kb.text("Next \u00BB", `teams_page_${validPage + 1}`);
    }
    kb.row();
    kb.text("Home", "back_to_main");

    await editOrSend(ctx, text, { reply_markup: kb }, imageUrl);
  } catch (err) {
    console.error("Teams List Error:", err);
    await editOrSend(ctx, "Failed to load teams. Try again later.");
  }
}
export async function handleTeamJoin(ctx: BotContext, teamId: string) {
  try {
    const s = ctx.session;
    if (!s.token) {
      return ctx.answerCallbackQuery({
        text: "Please login first.",
        show_alert: true,
      });
    }
    const u = (s.user || {}) as Record<string, string | undefined>;
    await createJoinRequest(s.token, {
      teamId,
      fullName: u.fullName || u.name || "Unknown",
      phoneNumber: u.phoneNumber || u.phone || "0000000000",
      department: u.department || "Unknown",
      year: u.year || "Unknown",
      telegramHandle: ctx.from?.username ? `@${ctx.from.username}` : "Unknown",
      message: "Join request from Telegram bot",
    });
    await ctx.answerCallbackQuery({
      text: "Join request sent successfully! A leader will review your request.",
      show_alert: true,
    });
  } catch (err) {
    console.error("Team Join Error:", err);
    const errorPrefix =
      err && typeof err === "object" && "response" in err
        ? (
            err as {
              response?: {
                data?: {
                  message?: string;
                };
              };
            }
          ).response?.data?.message
        : err instanceof Error
          ? err.message
          : "";
    await ctx.answerCallbackQuery({
      text: String(errorPrefix).includes("already")
        ? "You already have a pending request for this team."
        : "Failed to send join request. Try again.",
      show_alert: true,
    });
  }
}
export async function handleTeamDetail(ctx: BotContext) {
  ctx.session.currentPage = 1;
  return handleTeamsList(ctx);
}
