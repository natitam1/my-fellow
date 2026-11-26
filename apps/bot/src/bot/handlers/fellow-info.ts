import { BotContext } from "../context";
import { editOrSend } from "../message-manager";
import { fellowInfoReplyKeyboard, buildPaginationKeyboard } from "../keyboards";
import { config } from "../../config";
import { escapeHtml } from "../../utils/html";
import { InlineKeyboard, InputFile } from "grammy";
import path from "path";
export async function handleFellowInfo(ctx: BotContext, replyMarkup?: any) {
  ctx.session.state = "BROWSING";
  ctx.session.currentSection = "fellow_info";
  const imagePath = path.join(__dirname, "../../../src/assets/felow.jpg");
  const photo = new InputFile(imagePath);
  const contactLines = config.SUPPORT_CONTACTS.map(
    (c) => `• ${escapeHtml(c)}`,
  ).join("\n");
  const supportLines: string[] = [];
  if (config.SUPPORT_PHONE) {
    supportLines.push(`<b>Support Phone:</b> ${escapeHtml(config.SUPPORT_PHONE)}`);
  }
  if (config.SUPPORT_TELEGRAM) {
    supportLines.push(`<b>Support Telegram:</b> ${escapeHtml(config.SUPPORT_TELEGRAM)}`);
  }
  const text =
    `AAU 4-Killo Evangelical Christian Students' Fellowship (ECSF) official telegram bot.\n\n` +
    `It is a centralized platform designed to connect members with fellowship activities, announcements, devotionals, and community updates—all in one place.\n\n` +
    (contactLines ? `<b>Contact:</b>\n${contactLines}` : "") +
    (supportLines.length ? `\n\n${supportLines.join("\n")}` : "");
  const kb = new InlineKeyboard().url(
    "Official Channel",
    config.OFFICIAL_CHANNEL_URL,
  );
  const isCallback = ctx.callbackQuery !== undefined;
  try {
    if (isCallback) {
      try {
        await ctx.editMessageMedia(
          {
            type: "photo",
            media: photo,
            caption: text,
            parse_mode: "HTML",
          },
          {
            reply_markup: {
              inline_keyboard: kb.inline_keyboard,
              ...(replyMarkup?.reply_markup || {}),
            },
          },
        );
        await ctx.answerCallbackQuery().catch(() => {});
      } catch (e) {
        const msg = await ctx.replyWithPhoto(photo, {
          caption: text,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: kb.inline_keyboard,
            ...(replyMarkup?.reply_markup || {}),
          },
        });
        ctx.session.lastBotMessageId = msg.message_id;
        await ctx.answerCallbackQuery().catch(() => {});
      }
    } else {
      const msg = await ctx.replyWithPhoto(photo, {
        caption: text,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: kb.inline_keyboard,
          ...(replyMarkup?.reply_markup || {}),
        },
      });
      ctx.session.lastBotMessageId = msg.message_id;
    }
  } catch (err: any) {
    console.error("Home View Error:", err);
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: kb });
  }
}
export async function handleFellowFeatures(ctx: BotContext) {
  const { fellowInfoInlineMenu } = await import("../keyboards");
  const text =
    `<b>🛠️ Explore Features</b>\n\n` +
    `Select a category below to browse our community resources:`;
  await editOrSend(ctx, text, { reply_markup: fellowInfoInlineMenu() });
}
export async function handleSocialLinks(ctx: BotContext) {
  const text =
    `<b>Follow us on</b>\n\n` +
    `• <b>Telegram:</b> <a href="https://t.me/AAU_4Killo_Fellowship">Official Channel</a>\n` +
    `• <b>Instagram:</b> <a href="https://www.instagram.com/4Kilofellowship">4Kilofellowship</a>\n` +
    `• <b>TikTok:</b> <a href="https://www.tiktok.com/@4kilofellowship">4kilofellowship</a>\n` +
    `• <b>YouTube:</b> Coming soon`;
  const kb = buildPaginationKeyboard("social", 1, false);
  if (ctx.callbackQuery) {
    await ctx
      .editMessageCaption({
        caption: text,
        parse_mode: "HTML",
        reply_markup: kb,
      })
      .catch(async () => {
        await ctx.editMessageText(text, {
          parse_mode: "HTML",
          reply_markup: kb,
        });
      });
    await ctx.answerCallbackQuery().catch(() => {});
  } else {
    const msg = await ctx.reply(text, {
      parse_mode: "HTML",
      reply_markup: kb,
    });
    ctx.session.lastBotMessageId = msg.message_id;
  }
}
