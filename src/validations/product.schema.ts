import { z } from "zod";
import { stripRichText } from "@/lib/rich-text";

export const productCreateSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  description: z.string().refine((value) => stripRichText(value).length >= 10, {
    message: "Description is required",
  }),
  price: z.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Main category is required"),
  subCategoryId: z.string().min(1, "Sub category is required"),
  seoTags: z.string().max(500).optional().nullable(),
  images: z.array(z.string()).max(6).default([]),
  thumbnail: z.string().optional().nullable(),
});

export const productUpdateSchema = productCreateSchema.partial();
