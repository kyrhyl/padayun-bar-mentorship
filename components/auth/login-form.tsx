"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid login credentials.");
      setIsSubmitting(false);
      return;
    }

    router.push(result?.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form
      action={onSubmit}
      className="w-full space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">Padayun Sign In</h1>
        <p className="text-sm text-slate-600">Use your mentor or mentee account credentials.</p>
      </div>

      <label className="block text-sm text-slate-700">
        Email
        <input
          suppressHydrationWarning
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
        />
      </label>

      <label className="block text-sm text-slate-700">
        Password
        <input
          suppressHydrationWarning
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        suppressHydrationWarning
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
