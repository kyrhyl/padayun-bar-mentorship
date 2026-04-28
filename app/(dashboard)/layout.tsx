import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardHero } from "@/components/layout/dashboard-hero";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { getAppSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAppSession();

  const role = session?.user?.role;
  const name = session?.user?.name ?? "User";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#eef2f6] p-3 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <aside className="hidden w-64 border-r border-slate-200 bg-slate-50 px-4 py-5 lg:flex lg:flex-col">
          <Link href="/dashboard" className="px-2 text-xl font-bold tracking-tight text-slate-900">
            Padayun
          </Link>
          <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {role ? `${role} management` : "workspace"}
          </p>

          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
                {initials}
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-slate-900">{name}</p>
              <p className="text-xs capitalize text-slate-500">{session?.user?.role}</p>
            </div>
            <div className="mt-1.5 border-t border-slate-200 pt-1.5">
              <div className="flex justify-center">
                <SignOutButton />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <DashboardNav role={role} />
          </div>

          <div className="mt-auto space-y-3 px-1">
            <p className="text-xs text-slate-500">Help Center</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHero />

          <main className="min-w-0 flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
