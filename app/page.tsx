import { redirect } from "next/navigation";

import { getAppSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getAppSession();

  if (!session?.user) {
    redirect("/login");
  }

  redirect("/dashboard");
}
