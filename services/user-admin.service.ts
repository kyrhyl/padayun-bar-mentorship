import bcrypt from "bcryptjs";

import {
  adminCreateUserSchema,
  mentorAvailabilitySchema,
  type AdminCreateUserInput,
} from "@/lib/validators/user";
import {
  createUser,
  findUserByEmail,
  listUsersByRoles,
  setMentorAvailabilityByCycle,
} from "@/repositories/user.repository";

function getCurrentCycleId(): string {
  return process.env.CURRENT_CYCLE_ID?.trim() || "2026-Q2";
}

export async function createUserByAdminService(input: AdminCreateUserInput) {
  const parsed = adminCreateUserSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid user data.");
  }

  const existingUser = await findUserByEmail(parsed.data.email);
  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  return createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role,
  });
}

export async function listManagedUsersForAdminService() {
  return listUsersByRoles(["mentor", "mentee"]);
}

export async function setMentorAvailabilityService(input: {
  mentorId: string;
  availability: "available" | "unavailable";
}) {
  const parsed = mentorAvailabilitySchema.safeParse({
    ...input,
    cycleId: getCurrentCycleId(),
  });

  if (!parsed.success) {
    throw new Error("Invalid availability payload.");
  }

  await setMentorAvailabilityByCycle(parsed.data);
}
