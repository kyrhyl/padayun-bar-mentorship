import { z } from "zod";

import { QUESTION_DIFFICULTIES } from "@/models/Question";

export const questionSchema = z.object({
  subject: z.string().trim().min(2).max(80),
  topic: z.string().trim().min(2).max(80),
  difficulty: z.enum(QUESTION_DIFFICULTIES),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
  prompt: z.string().trim().min(20).max(5000),
});

export const questionFilterSchema = z.object({
  subject: z.string().trim().optional(),
  topic: z.string().trim().optional(),
  difficulty: z.enum(QUESTION_DIFFICULTIES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionFilterInput = z.infer<typeof questionFilterSchema>;
