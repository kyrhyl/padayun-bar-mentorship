import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getAppSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getAppSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <LoginForm />
    </main>
  );
}
