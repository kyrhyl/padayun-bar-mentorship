import { z } from "zod";

export const performanceRangeSchema = z.enum(["7d", "30d", "90d", "all"]);

export const performanceFilterSchema = z.object({
  range: performanceRangeSchema.default("30d"),
  subject: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type PerformanceFilterInput = z.infer<typeof performanceFilterSchema>;
