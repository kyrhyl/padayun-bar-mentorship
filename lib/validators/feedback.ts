import { z } from "zod";

const quarterStep = z.coerce
  .number()
  .min(0)
  .refine((value) => Number.isInteger(value * 4), "Score must be in 0.25 steps.");

export const feedbackFormSchema = z.object({
  submissionId: z.string().min(1),
  correctResponse: quarterStep.max(1),
  law: quarterStep.max(1),
  reasoning: quarterStep.max(1),
  logic: quarterStep.max(1),
  grammar: quarterStep.max(1),
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
