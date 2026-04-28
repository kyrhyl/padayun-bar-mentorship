import { z } from "zod";

export const autosaveSubmissionSchema = z.object({
  submissionId: z.string().min(1),
  questionId: z.string().min(1).optional(),
  answer: z.string().max(50000),
  clientSavedAt: z.string().datetime().optional(),
});

export const submitSubmissionSchema = z.object({
  submissionId: z.string().min(1),
});

export const securityEventSchema = z.object({
  submissionId: z.string().min(1),
  type: z.literal("tab_switch"),
  at: z.string().datetime().optional(),
});
