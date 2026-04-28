"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardNavProps {
  role?: "admin" | "mentor" | "mentee";
}

function linkClass(isActive: boolean) {
  return isActive
    ? "flex items-center rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white"
    : "flex items-center rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-white hover:text-slate-900";
}

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();

  const links: Array<{ href: string; label: string; active: boolean }> = [];

  if (role === "mentee") {
    links.push(
      {
        href: "/mentee/dashboard",
        label: "Dashboard",
        active: pathname.startsWith("/mentee/dashboard") || pathname === "/mentee",
      },
      { href: "/mentee/exams", label: "Exams", active: pathname.startsWith("/mentee/exams") },
    );
  } else if (role === "admin") {
    links.push({ href: "/dashboard", label: "Dashboard", active: pathname === "/dashboard" });
  }

  if (role === "admin") {
    links.push(
      { href: "/admin/questions", label: "Questions", active: pathname.startsWith("/admin/questions") },
      { href: "/admin/exams", label: "Exams", active: pathname.startsWith("/admin/exams") },
      { href: "/admin/assignments", label: "Assignments", active: pathname.startsWith("/admin/assignments") },
      { href: "/admin/users", label: "Users", active: pathname.startsWith("/admin/users") },
      { href: "/admin/performance", label: "Performance", active: pathname.startsWith("/admin/performance") },
    );
  }

  if (role === "mentor") {
    links.push(
      { href: "/mentor", label: "Dashboard", active: pathname === "/mentor" },
      {
        href: "/mentor/feedback",
        label: "Feedback",
        active: pathname === "/mentor/feedback" || pathname.startsWith("/mentor/reviews"),
      },
      { href: "/mentor/performance", label: "Performance", active: pathname.startsWith("/mentor/performance") },
    );
  }

  return (
    <nav className="space-y-1.5 text-sm font-medium">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={linkClass(link.active)}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
