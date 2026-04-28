import { z } from "zod";

export const examListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
  subject: z.string().trim().optional(),
  topic: z.string().trim().optional(),
});

const baseExamSchema = z.object({
  title: z.string().trim().min(5).max(120),
  subject: z.string().trim().min(2).max(80),
  topic: z.string().trim().min(2).max(80),
  durationMinutes: z.coerce.number().int().min(10).max(240),
  instructions: z.string().trim().min(10).max(1000),
  isPublished: z.boolean().default(false),
});

const legacyExamSchema = baseExamSchema.extend({
  questionId: z.string().min(1),
});

const manualExamSchema = baseExamSchema.extend({
  questionMode: z.literal("manual"),
  questionIds: z.array(z.string().min(1)).min(1),
});

const randomPoolExamSchema = baseExamSchema.extend({
  questionMode: z.literal("random_pool"),
  poolConfig: z.object({
    subject: z.string().trim().min(2).max(80).optional(),
    topic: z.string().trim().min(2).max(80).optional(),
    difficulties: z.array(z.enum(["easy", "medium", "hard"])).default([]),
    tags: z.array(z.string().trim().min(1)).default([]),
    questionCount: z.coerce.number().int().min(1).max(100),
  }),
});

export const examSchema = z.union([legacyExamSchema, manualExamSchema, randomPoolExamSchema]);

export type ExamListFiltersInput = z.infer<typeof examListFiltersSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type ManualExamInput = z.infer<typeof manualExamSchema>;
export type RandomPoolExamInput = z.infer<typeof randomPoolExamSchema>;
