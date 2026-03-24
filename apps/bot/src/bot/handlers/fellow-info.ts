import { BotContext } from "../context";
import { deleteLastBotMessage } from "../message-manager";
import { fellowInfoInlineMenu } from "../keyboards";
import { InlineKeyboard } from "grammy";

const HOME_IMAGE =
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

export async function handleFellowInfo(ctx: BotContext) {
  ctx.session.state = "BROWSING";
  ctx.session.currentSection = "fellow_info";

  const text =
    `<b>My Fellow</b>\n\n` +
    `<b>About:</b> AAU 4-Killo fellowship bot\n` +
    `<b>Description:</b> AAU 4-Killo Evangelical Christian Students’ Fellowship (ECSF) official telegram bot.\n\n` +
    `It is a centralized platform designed to connect members with fellowship activities, announcements, devotionals, and community updates—all in one place.\n\n` +
    `<b>Contact:</b>\n` +
    `• @Jesus_died_for_me\n` +
    `• @fellowship_leader\n\n` +
    `<b>Developer:</b> 0911000002\n` +
    `<b>Telegram:</b> @natitam1`;

  const kb = new InlineKeyboard()
    .text("Explore Features", "fi_features")
    .url("Official Channel", "https://t.me/AAU_4Killo_Fellowship")
    .row()
    .text("Back to Menu", "back_to_menu");

  const isCallback = ctx.callbackQuery !== undefined;

  try {
    if (isCallback) {
      try {
        await ctx.editMessageMedia(
          {
            type: "photo",
            media: HOME_IMAGE,
            caption: text,
            parse_mode: "HTML",
          },
          { reply_markup: kb },
        );
        await ctx.answerCallbackQuery().catch(() => {});
      } catch (e) {
        await deleteLastBotMessage(ctx);
        const msg = await ctx.replyWithPhoto(HOME_IMAGE, {
          caption: text,
          parse_mode: "HTML",
          reply_markup: kb,
        });
        ctx.session.lastBotMessageId = msg.message_id;
        await ctx.answerCallbackQuery().catch(() => {});
      }
    } else {
      await deleteLastBotMessage(ctx);
      const msg = await ctx.replyWithPhoto(HOME_IMAGE, {
        caption: text,
        parse_mode: "HTML",
        reply_markup: kb,
      });
      ctx.session.lastBotMessageId = msg.message_id;
    }
  } catch (err: any) {
    console.error("Home View Error:", err);
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: kb });
  }
}

export async function handleFellowFeatures(ctx: BotContext) {
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
