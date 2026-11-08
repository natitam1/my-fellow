import { z } from "zod";

// ─── Shared enum ────────────────────────────────────────────────────
const DEVOTION_TYPES = ["text", "voice"] as const;
const devotionTypeEnum = z.enum(DEVOTION_TYPES, {
  message: "Type must be one of: text, voice",
});

// ─── Create ─────────────────────────────────────────────────────────
export const createDevotionSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    author: z
      .string()
      .optional()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
    authorId: z.string().optional(),
    authorActorId: z.string().optional(),
    actorHandle: z.string().optional(),
    actorType: z.enum(["official", "team", "user"]).optional(),
    authorHandle: z.string().optional(),
    authorAvatar: z
      .string()
      .optional()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
    authorRole: z.string().optional(),
    authorUsername: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    type: devotionTypeEnum,
    image: z
      .string()
      .optional()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)), // May come via file upload instead
    views: z.coerce.number().int().min(0).optional(),
    likes: z.coerce.number().int().min(0).optional(),

    // Text type
    content: z.string().optional(),

    // Voice type
    audioUrl: z
      .string()
      .optional()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
    duration: z.string().optional(),
    caption: z.string().optional(), // Mandatory caption/transcript for voice devotions

    // Shared metadata
    tags: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (Array.isArray(val)) return val.map((t) => String(t).trim()).filter(Boolean);
        if (typeof val === "string") {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              return parsed.map((t) => String(t).trim()).filter(Boolean);
            }
          } catch {}
          return val.split(",").map((t) => t.trim()).filter(Boolean);
        }
        return undefined;
      }),
    featured: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) =>
        val === "true" || val === true
          ? true
          : val === "false"
            ? false
            : undefined,
      ),
  })
  .superRefine((data, ctx) => {
    // Type-specific validation
    if (data.type === "text" && !data.content) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Text devotions require a 'content' field",
        path: ["content"],
      });
    }

    if (data.type === "voice") {
      if (!data.duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Voice devotions require a 'duration' field (e.g. '5:20')",
          path: ["duration"],
        });
      }
      if (!data.caption && !data.content) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Voice devotions always require a caption or transcript text",
          path: ["caption"],
        });
      }
    }
  });

// ─── Update ─────────────────────────────────────────────────────────
export const updateDevotionSchema = z.object({
  title: z.string().min(3).optional(),
  author: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
  authorId: z.string().optional(),
  authorActorId: z.string().optional(),
  actorHandle: z.string().optional(),
  actorType: z.enum(["official", "team", "user"]).optional(),
  authorHandle: z.string().optional(),
  authorAvatar: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
  authorRole: z.string().optional(),
  authorUsername: z.string().optional(),
  date: z.string().optional(),
  type: devotionTypeEnum.optional(),
  image: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
  views: z.coerce.number().int().min(0).optional(),
  likes: z.coerce.number().int().min(0).optional(),

  content: z.string().optional(),

  audioUrl: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
  duration: z.string().optional(),
  caption: z.string().optional(),

  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val.map((t) => String(t).trim()).filter(Boolean);
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            return parsed.map((t) => String(t).trim()).filter(Boolean);
          }
        } catch {}
        return val.split(",").map((t) => t.trim()).filter(Boolean);
      }
      return undefined;
    }),
  featured: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) =>
      val === "true" || val === true
        ? true
        : val === "false"
          ? false
          : undefined,
    ),
});

export type CreateDevotionInput = z.infer<typeof createDevotionSchema>;
export type UpdateDevotionInput = z.infer<typeof updateDevotionSchema>;
