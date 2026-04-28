"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors duration-150 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
    >
      Sign out
    </button>
  );
}
