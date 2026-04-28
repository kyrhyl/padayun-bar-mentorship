import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAppSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAppSession();

  const role = session?.user?.role;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
              Padayun
            </Link>
            <nav className="flex items-center gap-3 text-sm text-slate-700">
              <Link href="/dashboard" className="hover:text-slate-900">
                Dashboard
              </Link>
              {role === "admin" ? (
                <>
                  <Link href="/admin/questions" className="hover:text-slate-900">
                    Questions
                  </Link>
                  <Link href="/admin/exams" className="hover:text-slate-900">
                    Exams
                  </Link>
                  <Link href="/admin/assignments" className="hover:text-slate-900">
                    Assignments
                  </Link>
                </>
              ) : null}
              {role === "mentor" ? (
                <Link href="/mentor" className="hover:text-slate-900">
                  Mentor
                </Link>
              ) : null}
              {role === "mentee" ? (
                <Link href="/mentee" className="hover:text-slate-900">
                  Mentee
                </Link>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-600">
              {session?.user?.name} ({session?.user?.role})
            </p>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
