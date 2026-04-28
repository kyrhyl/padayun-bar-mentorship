import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/authorization";

export default async function DashboardPage() {
  const session = await requireAuth();

  if (session.user.role === "admin") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">
          Manage the question bank and prepare exam prompts for mentor-led practice.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/questions"
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Open Question Bank
          </Link>
          <Link
            href="/admin/exams"
            className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
          >
            Manage Exams
          </Link>
          <Link
            href="/admin/assignments"
            className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
          >
            Manage Assignments
          </Link>
        </div>
      </section>
    );
  }

  if (session.user.role === "mentor") {
    redirect("/mentor");
  }

  redirect("/mentee");
}
