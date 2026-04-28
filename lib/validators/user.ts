import { z } from "zod";

export const ADMIN_CREATABLE_USER_ROLES = ["mentor", "mentee"] as const;

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
  role: z.enum(ADMIN_CREATABLE_USER_ROLES),
});

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;

export const mentorAvailabilitySchema = z.object({
  mentorId: z.string().min(1),
  availability: z.enum(["available", "unavailable"]),
  cycleId: z.string().trim().min(1),
});

export type MentorAvailabilityInput = z.infer<typeof mentorAvailabilitySchema>;
