import { BotContext } from "../context";
import { deleteLastBotMessage } from "../message-manager";
import { fellowInfoReplyKeyboard } from "../keyboards";
import { InlineKeyboard, InputFile } from "grammy";
import path from "path";

export async function handleFellowInfo(ctx: BotContext, replyMarkup?: any) {
  ctx.session.state = "BROWSING";
  ctx.session.currentSection = "fellow_info";

  const imagePath = path.join(__dirname, "../../../src/assets/felow.jpg");
  const photo = new InputFile(imagePath);

  const text =
    `AAU 4-Killo Evangelical Christian Students' Fellowship (ECSF) official telegram bot.\n\n` +
    `It is a centralized platform designed to connect members with fellowship activities, announcements, devotionals, and community updates—all in one place.\n\n` +
    `<b>Contact:</b>\n` +
    `• @Jesus_died_for_me\n` +
    `• @fellowship_leader\n\n` +
    `<b>Developer:</b> 0911000002\n` +
    `<b>Telegram:</b> @natitam1`;

  const kb = new InlineKeyboard().url(
    "Official Channel",
    "https://t.me/AAU_4Killo_Fellowship",
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
        await deleteLastBotMessage(ctx);
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
      await deleteLastBotMessage(ctx);
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

  await ctx
    .editMessageCaption({
      caption: text,
      parse_mode: "HTML",
      reply_markup: fellowInfoInlineMenu(),
    })
    .catch(async () => {
      await ctx.editMessageText(text, {
        parse_mode: "HTML",
        reply_markup: fellowInfoInlineMenu(),
      });
    });
  await ctx.answerCallbackQuery().catch(() => {});
}

export async function handleSocialLinks(ctx: BotContext) {
  const text =
    `<b>Official Social Media</b>\n\n` +
    `Stay connected with us on our other platforms:\n\n` +
    `• <b>Telegram:</b> <a href="https://t.me/AAU_4Killo_Fellowship">@AAU_4Killo_Fellowship</a>\n` +
    `• <b>Instagram:</b> <a href="https://www.instagram.com/aau_4killo_fellowship">@aau_4killo_fellowship</a>\n` +
    `• <b>TikTok:</b> <a href="https://www.tiktok.com/@aau_4killo_fellowship">@aau_4killo_fellowship</a>`;

  const kb = new InlineKeyboard().text("Back", "fi_menu");

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
}
