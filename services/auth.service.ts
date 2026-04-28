import bcrypt from "bcryptjs";

import type { UserRole } from "@/domain/types/auth";
import { loginSchema } from "@/lib/validators/auth";
import { findUserByEmail } from "@/repositories/user.repository";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export async function authenticateWithCredentials(input: {
  email: string;
  password: string;
}): Promise<AuthUser | null> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }

  const user = await findUserByEmail(parsed.data.email.toLowerCase());
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
