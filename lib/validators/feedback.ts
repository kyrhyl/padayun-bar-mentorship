import { z } from "zod";

const scorePart = z.coerce.number().min(0).max(100);

export const feedbackFormSchema = z.object({
  submissionId: z.string().min(1),
  conclusion: scorePart,
  law: scorePart,
  reasoning: scorePart,
  comments: z.string().trim().min(10).max(4000),
});

export const listPageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export const mentorReviewFilterSchema = listPageSchema.extend({
  menteeId: z.string().trim().optional(),
  subject: z.string().trim().optional(),
});
