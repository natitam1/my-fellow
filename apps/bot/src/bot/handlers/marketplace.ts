import { BotContext } from "../context";
import { getAllProducts, getProductById } from "../../api/marketplace";
import { editOrSend } from "../message-manager";
import { buildPaginationKeyboard } from "../keyboards";
import { InlineKeyboard } from "grammy";
const PAGE_SIZE = 5;
export async function handleProductsList(ctx: BotContext) {
    ctx.session.currentSection = "marketplace";
    const page = ctx.session.currentPage || 1;
    const result = await getAllProducts();
    const allProducts = Array.isArray(result)
        ? result
        : result.products || result.data || [];
    if (!allProducts.length)
        return editOrSend(ctx, "No products found in marketplace.");
    const start = (page - 1) * PAGE_SIZE;
    const pagedProducts = allProducts.slice(start, start + PAGE_SIZE);
    const hasMore = allProducts.length > start + PAGE_SIZE;
    let text = `Marketplace\n\nPage ${page} of ${Math.ceil(allProducts.length / PAGE_SIZE)}\n\nBrowse our community products:\n\n`;
    const kb = buildPaginationKeyboard("marketplace", page, hasMore);
    for (const product of pagedProducts) {
        kb.text(`${product.title} - ${product.price} ETB`, `product_view_${product.id}`).row();
    }
    await editOrSend(ctx, text, { reply_markup: kb });
}
export async function handleProductDetail(ctx: BotContext, id: string) {
    try {
        const result = await getProductById(id);
        const p = result.product || result;
        const text = `Product Detail\n\nTitle: ${p.title}\nDescription: ${p.shortDescription || "N/A"}\nPrice: ${p.price} ETB\nStock: ${p.stock || 0}`;
        const kb = new InlineKeyboard()
            .text("Order Now", `product_order_${p.id}`)
            .row()
            .text("Back", "fi_marketplace");
        await editOrSend(ctx, text, { reply_markup: kb });
    }
    catch {
        await editOrSend(ctx, "Could not load product detail.");
    }
}
