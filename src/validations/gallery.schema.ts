import { z } from "zod";

export const gallerySectionUpdateSchema = z.object({
  maxItems: z
    .number({ error: "Gallery item limit is required" })
    .int("Gallery item limit must be a whole number")
    .min(1, "Gallery must allow at least 1 image")
    .max(24, "Gallery can allow up to 24 images"),
});

export const galleryItemCreateSchema = z.object({
  imageUrl: z.url("Gallery image is required"),
  categoryId: z.string().min(1, "Main category is required"),
  position: z.number().int().min(0).optional(),
});

export const galleryItemUpdateSchema = galleryItemCreateSchema.partial();
