import { z } from "zod";

export const examListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
  subject: z.string().trim().optional(),
  topic: z.string().trim().optional(),
});

export const examSchema = z.object({
  title: z.string().trim().min(5).max(120),
  subject: z.string().trim().min(2).max(80),
  topic: z.string().trim().min(2).max(80),
  questionId: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(10).max(240),
  instructions: z.string().trim().min(10).max(1000),
  isPublished: z.boolean().default(false),
});

export type ExamListFiltersInput = z.infer<typeof examListFiltersSchema>;
export type ExamInput = z.infer<typeof examSchema>;
