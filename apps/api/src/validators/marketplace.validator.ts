import { z } from "zod";

// ─── Product schemas ─────────────────────────────────────────

const imageUrlsPreprocess = z
  .preprocess((val) => {
    if (!val || val === "[]") return undefined;
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return [val];
    }
    return val;
  }, z.array(z.string().url("Each image must be a valid URL")).max(10))
  .optional();

export const createProductSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title must be at most 200 characters"),
      shortDescription: z
        .string()
        .min(3, "Short description must be at least 3 characters")
        .max(3000, "Short description must be at most 3000 characters")
        .optional(),
      description: z.string().max(3000).optional(),
      price: z.coerce
        .number({ message: "Price must be a number" })
        .positive("Price must be greater than 0"),
      category: z.string().optional().default("other"),
      imageUrls: imageUrlsPreprocess,
      stock: z.coerce
        .number({ message: "Stock must be a number" })
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative")
        .optional()
        .default(10),
      isActive: z.coerce.boolean().optional().default(true),
    })
    .refine((data) => Boolean(data.shortDescription || data.description), {
      message: "Product description is required",
      path: ["shortDescription"],
    }),
});

export const updateProductSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be at most 200 characters")
      .optional(),
    shortDescription: z
      .string()
      .min(3, "Short description must be at least 3 characters")
      .max(3000, "Short description must be at most 3000 characters")
      .optional(),
    description: z.string().max(3000).optional(),
    price: z.coerce
      .number({ message: "Price must be a number" })
      .positive("Price must be greater than 0")
      .optional(),
    imageUrls: imageUrlsPreprocess,
    category: z.string().optional(),
    stock: z.coerce
      .number({ message: "Stock must be a number" })
      .int("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .optional(),
    isActive: z.coerce.boolean().optional(),
  }),
});

// ─── Order schemas ───────────────────────────────────────────

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1, "Product ID is required"),
          quantity: z.coerce
            .number({ message: "Quantity must be a number" })
            .int("Quantity must be an integer")
            .min(1, "Quantity must be at least 1"),
          size: z.string().optional(),
        }),
      )
      .min(1, "At least one item is required"),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      { message: "Invalid order status" },
    ),
  }),
});
