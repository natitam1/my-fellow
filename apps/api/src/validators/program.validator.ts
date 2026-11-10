import { z } from "zod";

export const coordinatesSchema = z.union([
  z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
  z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      return {
        lat: Number(parsed.lat),
        lng: Number(parsed.lng),
      };
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid coordinates format",
      });
      return z.NEVER;
    }
  }),
]);

export const programBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  day: z.string().min(2, "Day is required"),
  time: z.string().min(2, "Time is required"),
  category: z.string().min(2, "Category is required"),
  location: z.string().min(2, "Location is required"),
  coordinates: coordinatesSchema,
  image: z.string().optional().default(""),
});

export type Program = z.infer<typeof programBaseSchema>;
export type ProgramCoordinates = { lat: number; lng: number };
