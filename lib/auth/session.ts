import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth.config";

export async function getAppSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}
