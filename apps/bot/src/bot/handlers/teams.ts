import { BotContext } from "../context";
import { getAllTeams, createJoinRequest } from "../../api/teams";
import { deleteLastBotMessage, editOrSend } from "../message-manager";
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

    // Build caption text
    let titleText = `<b>${escapeHTML(team.name)}</b>\n`;
    if (team.members) {
      titleText += `${team.members} Members\n`;
    }
    titleText += `\n`;

    let bodyText = "";
    if (team.description) {
      bodyText += `${escapeHTML(team.description)}\n\n`;
    }
    if (team.about) {
      bodyText += `${escapeHTML(team.about)}\n\n`;
    }
    if (team.meetingDay) {
      bodyText += `Day: ${escapeHTML(team.meetingDay)}\n`;
    }
    if (team.time) {
      bodyText += `Time: ${escapeHTML(team.time)}\n`;
    }
    if (team.location) {
      if (team.coordinates?.lat && team.coordinates?.lng) {
        bodyText += `Location: <a href="https://www.google.com/maps/search/?api=1&query=${team.coordinates.lat},${team.coordinates.lng}">${escapeHTML(team.location)}</a>\n`;
      } else {
        bodyText += `Location: ${escapeHTML(team.location)}\n`;
      }
    }
    if (team.leader?.name) {
      let leaderLine = `Leader: <b>${escapeHTML(team.leader.name)}</b>`;
      if (team.leader.role) leaderLine += ` (${escapeHTML(team.leader.role)})`;
      if (team.leader.telegram) {
        const handle = team.leader.telegram.replace("@", "");
        leaderLine += ` — <a href="https://t.me/${handle}">@${handle}</a>`;
      }
      bodyText += `\n${leaderLine}\n`;
    }

    const imageUrl = sanitizeImageUrl(team.imageUrl);
    const isPhoto = !!imageUrl;
    const limit = isPhoto ? MAX_CAPTION_LENGTH : 4096;

    let text = titleText + bodyText;
    if (text.length > limit) {
      text =
        titleText + bodyText.substring(0, limit - titleText.length - 3) + "...";
    }

    // Build keyboard
    const kb = new InlineKeyboard();
    const teamId = team._id || team.id;
    kb.text("Join Team", `team_join_${teamId}`).row();

    if (team.leader?.telegram) {
      const handle = team.leader.telegram.replace("@", "");
      kb.url("Contact Leader", `https://t.me/${handle}`).row();
    }

    if (validPage > 1) {
      kb.text("« Prev", `teams_page_${validPage - 1}`);
    }
    if (hasMore) {
      kb.text("Next »", `teams_page_${validPage + 1}`);
    }
    kb.row();
    kb.text("Home", "back_to_main");

    // Send message (same pattern as Events)
    const isCallback = ctx.callbackQuery !== undefined;

    let msg;
    if (imageUrl) {
      if (isCallback) {
        try {
          msg = await ctx.editMessageMedia(
            {
              type: "photo",
              media: imageUrl,
              caption: text,
              parse_mode: "HTML",
            },
            { reply_markup: kb },
          );
          await ctx.answerCallbackQuery().catch(() => {});
        } catch {
          await deleteLastBotMessage(ctx);
          msg = await ctx.replyWithPhoto(imageUrl, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: kb,
          });
          await ctx.answerCallbackQuery().catch(() => {});
        }
      } else {
        await deleteLastBotMessage(ctx);
        msg = await ctx.replyWithPhoto(imageUrl, {
          caption: text,
          parse_mode: "HTML",
          reply_markup: kb,
        });
      }
    } else {
      if (isCallback) {
        try {
          msg = await ctx.editMessageText(text, {
            parse_mode: "HTML",
            reply_markup: kb,
          });
          await ctx.answerCallbackQuery().catch(() => {});
        } catch {
          await deleteLastBotMessage(ctx);
          msg = await ctx.reply(text, {
            parse_mode: "HTML",
            reply_markup: kb,
          });
          await ctx.answerCallbackQuery().catch(() => {});
        }
      } else {
        await deleteLastBotMessage(ctx);
        msg = await ctx.reply(text, {
          parse_mode: "HTML",
          reply_markup: kb,
        });
      }
    }

    if (msg && typeof msg !== "boolean") {
      ctx.session.lastBotMessageId = msg.message_id;
    }
  } catch (err) {
    console.error("Teams List Error:", err);
    await editOrSend(ctx, "Failed to load teams. Try again later.");
  }
}

export async function handleTeamJoin(ctx: BotContext, teamId: string) {
  try {
    const s = ctx.session;
    if (!s.user || !s.token) {
      return ctx.answerCallbackQuery({
        text: "Please login first.",
        show_alert: true,
      });
    }

    const u = s.user as Record<string, string | undefined>;
    await createJoinRequest(s.token, {
      teamId,
      fullName: u.fullName || u.name || "N/A",
      phoneNumber: u.phoneNumber || u.phone || "N/A",
      department: u.department || "N/A",
      year: u.year || "N/A",
      telegramHandle: ctx.from?.username ? `@${ctx.from.username}` : "N/A",
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
        ? (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
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

// Keep for backward compatibility with old detail view callbacks
export async function handleTeamDetail(ctx: BotContext) {
  ctx.session.currentPage = 1;
  return handleTeamsList(ctx);
}
