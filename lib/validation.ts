import { z } from "zod";

export const channelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Channel name must be at least 2 characters.")
    .max(50, "Channel name must be at most 50 characters."),
  description: z
    .string()
    .trim()
    .max(300, "Description must be at most 300 characters.")
    .optional()
    .or(z.literal("")),
  createdBy: z.coerce.number().int().positive()
});

export const postSchema = z.object({
  channelId: z.coerce.number().int().positive(),
  authorId: z.coerce.number().int().positive(),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be at most 120 characters."),
  body: z
    .string()
    .trim()
    .min(3, "Body must be at least 3 characters.")
    .max(5000, "Body must be at most 5000 characters.")
});

export const replySchema = z.object({
  postId: z.coerce.number().int().positive(),
  authorId: z.coerce.number().int().positive(),
  body: z
    .string()
    .trim()
    .min(1, "Reply cannot be empty.")
    .max(3000, "Reply must be at most 3000 characters.")
});

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(" ");
}