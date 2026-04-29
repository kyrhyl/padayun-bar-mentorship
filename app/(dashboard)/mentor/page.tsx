import Link from "next/link";

import { requireRole } from "@/lib/auth/authorization";
import { perfLog, perfNow } from "@/lib/observability/perf";
import { getMentorPerformanceListService } from "@/services/performance.service";

interface MentorPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function MentorPage({ searchParams }: MentorPageProps) {
  const startedAt = perfNow();
  const session = await requireRole(["mentor", "admin"]);
  const _params = await searchParams;

  const kpis = await getMentorPerformanceListService(session.user.id, {
    range: "all",
    page: 1,
    limit: 20,
  });

  perfLog("route:/mentor", startedAt, {
    role: session.user.role,
    items: kpis.items.length,
  });

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Mentor Dashboard</h1>
        <p className="text-sm text-slate-600">Per-mentee KPI cards for workload and progress at a glance.</p>
      </div>

      {kpis.items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
          No assigned mentee data yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {kpis.items.map((item) => (
            <article key={item.menteeId} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{item.menteeName}</h2>
                  <p className="truncate text-xs text-slate-500">{item.menteeEmail}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Pending</p>
                    <p className="text-lg font-semibold text-slate-900">{item.pendingReviews}</p>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Graded</p>
                    <p className="text-lg font-semibold text-slate-900">{item.reviewedSubmissions}</p>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Total Exams</p>
                    <p className="text-lg font-semibold text-slate-900">{item.totalSubmissions}</p>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Avg Score</p>
                    <p className="text-lg font-semibold text-slate-900">{item.averageScore ?? "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Link href={`/mentor/feedback?pendingMenteeId=${item.menteeId}`} className="font-medium text-slate-900 underline">
                    Review Queue
                  </Link>
                  <Link href={`/mentor/performance/${item.menteeId}?range=all`} className="text-slate-700 underline">
                    View Performance
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
