import { BotContext } from "../context";
import {
  getAllDevotions,
  recordDevotionView,
  likeUnlikeDevotion,
} from "../../api/devotions";
import { InlineKeyboard } from "grammy";

/**
 * Show devotions list — supports type filter.
 */
export async function handleViewDevotions(
  ctx: BotContext,
  type?: "text" | "voice" | "pdf" | "book",
) {
  try {
    const result = await getAllDevotions({
      page: ctx.session.page || 1,
      limit: 10,
      type,
    });
    const devotions = Array.isArray(result)
      ? result
      : result.devotions || result.data || [];

    if (!devotions.length) {
      await ctx.reply("📖 No devotions found.");
      return;
    }

    const kb = new InlineKeyboard();
    for (const d of devotions.slice(0, 10)) {
      const icon =
        d.type === "voice"
          ? "🎧"
          : d.type === "pdf"
            ? "📄"
            : d.type === "book"
              ? "📚"
              : "📝";
      kb.text(`${icon} ${d.title}`, `devotion_${d._id}`).row();
    }

    // Filter buttons
    kb.text("📝 Text", "devfilter_text")
      .text("🎧 Voice", "devfilter_voice")
      .text("📄 PDF", "devfilter_pdf")
      .row();
    kb.text("🔙 Back to Menu", "back_to_menu");

    await ctx.reply("📖 *Devotions*\n\nSelect a devotion to read or listen:", {
      parse_mode: "Markdown",
      reply_markup: kb,
    });
  } catch (err: any) {
    await ctx.reply("❌ Failed to load devotions.");
    console.error("handleViewDevotions error:", err.message);
  }
}

/**
 * Show a single devotion detail.
 */
export async function handleDevotionDetail(
  ctx: BotContext,
  devotionId: string,
) {
  try {
    // Record a view
    await recordDevotionView(devotionId).catch(() => {});

    const result = await getAllDevotions();
    const devotions = Array.isArray(result)
      ? result
      : result.devotions || result.data || [];
    const d = devotions.find((dev: any) => dev._id === devotionId);

    if (!d) {
      await ctx.reply("❌ Devotion not found.");
      return;
    }

    let text = `📖 *${d.title}*\n`;
    text += `✍️ _by ${d.author}_\n\n`;
    if (d.type === "text" && d.content) {
      text += d.content.substring(0, 3000);
    }
    if (d.duration) text += `\n⏱ Duration: ${d.duration}`;
    if (d.tags) text += `\n🏷 Tags: ${d.tags}`;

    const kb = new InlineKeyboard();
    if (ctx.session.token) {
      kb.text("❤️ Like / Unlike", `like_dev_${d._id}`).row();
    }
    if (d.type === "voice" && d.media) {
      kb.text("🎧 Listen", `listen_dev_${d._id}_${d.media}`).row();
    }
    if ((d.type === "pdf" || d.type === "book") && d.media) {
      kb.text("📄 Download", `download_dev_${d._id}_${d.media}`).row();
    }
    kb.text("🔙 Back to Devotions", "view_devotions");

    if (d.image) {
      await ctx.replyWithPhoto(d.image, {
        caption: text,
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } else {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
    }
  } catch (err: any) {
    await ctx.reply("❌ Could not load devotion.");
    console.error("handleDevotionDetail error:", err.message);
  }
}

/**
 * Like or unlike a devotion (toggle).
 */
export async function handleLikeDevotion(ctx: BotContext, devotionId: string) {
  if (!ctx.session.token) {
    await ctx.reply("🔒 Please log in first to like devotions.");
    return;
  }
  try {
    const result = await likeUnlikeDevotion(ctx.session.token, devotionId);
    await ctx.answerCallbackQuery(result.message || "Toggled like!");
  } catch (err: any) {
    await ctx.answerCallbackQuery("Failed to toggle like.");
  }
}
