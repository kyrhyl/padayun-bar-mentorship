import { redirect } from "next/navigation";

import type { UserRole } from "@/domain/types/auth";
import { getAppSession } from "@/lib/auth/session";

export async function requireAuth() {
  const session = await getAppSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role)) {
    redirect("/forbidden");
  }

  return session;
}
