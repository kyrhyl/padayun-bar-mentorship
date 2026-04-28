import { z } from "zod";

export const mentorAssignmentSchema = z.object({
  mentorId: z.string().min(1),
  menteeId: z.string().min(1),
});
