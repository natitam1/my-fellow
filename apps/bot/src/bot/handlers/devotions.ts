import { BotContext } from "../context";
import { getAllDevotions, recordDevotionView, likeUnlikeDevotion, } from "../../api/devotions";
import { editOrSend } from "../message-manager";
import { buildPaginationKeyboard } from "../keyboards";
import { InlineKeyboard } from "grammy";
const PAGE_SIZE = 5;
export async function handleDevotionsList(ctx: BotContext) {
    ctx.session.currentSection = "devotions";
    const page = ctx.session.currentPage || 1;
    const type = ctx.session.onboardingData?.team as any;
    try {
        const result = await getAllDevotions({ page, limit: PAGE_SIZE, type });
        const allDevotions = Array.isArray(result)
            ? result
            : result.devotions || result.data || [];
        const total = result.total || allDevotions.length;
        if (!allDevotions.length) {
            return editOrSend(ctx, "No devotions available.");
        }
        const hasMore = total > page * PAGE_SIZE;
        let text = `Devotions\n\nPage ${page} of ${Math.ceil(total / PAGE_SIZE)}\n\nSelect a devotion for more detail:\n\n`;
        const kb = buildPaginationKeyboard("devotions", page, hasMore);
        for (const dev of allDevotions) {
            kb.text(dev.title, `devotion_view_${dev._id}`).row();
        }
        await editOrSend(ctx, text, { reply_markup: kb });
    }
    catch (err: any) {
        await editOrSend(ctx, "Failed to load devotions.");
    }
}
export async function handleDevotionDetail(ctx: BotContext, devotionId: string) {
    try {
        await recordDevotionView(devotionId).catch(() => { });
        const result = await getAllDevotions();
        const devotions = Array.isArray(result)
            ? result
            : result.devotions || result.data || [];
        const d = devotions.find((dev: any) => dev._id === devotionId);
        if (!d) {
            return editOrSend(ctx, "Devotion not found.");
        }
        const text = `Devotion Detail\n\nTitle: ${d.title}\nAuthor: ${d.author}\n\nContent:\n${d.content?.substring(0, 1000) || ""}`;
        const kb = new InlineKeyboard();
        if (ctx.session.token) {
            kb.text("Like / Unlike", `devotion_like_${d._id}`).row();
        }
        kb.text("Back", "fi_devotions");
        await editOrSend(ctx, text, { reply_markup: kb });
    }
    catch (err: any) {
        await editOrSend(ctx, "Error loading devotion detail.");
    }
}
