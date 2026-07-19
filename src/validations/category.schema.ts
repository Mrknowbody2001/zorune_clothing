import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(2, "Category name is required").max(120),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
