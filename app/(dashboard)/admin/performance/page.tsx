import Link from "next/link";

import { requireRole } from "@/lib/auth/authorization";
import { getAdminPerformanceListService } from "@/services/performance.service";

interface AdminPerformancePageProps {
  searchParams: Promise<{ range?: string; subject?: string; page?: string; limit?: string }>;
}

export default async function AdminPerformancePage({ searchParams }: AdminPerformancePageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const performance = await getAdminPerformanceListService({
    range: params.range,
    subject: params.subject,
    page: params.page,
    limit: params.limit,
  });

  const previousPage = Math.max(1, performance.meta.page - 1);
  const nextPage = Math.min(performance.meta.totalPages, performance.meta.page + 1);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Mentee Performance</h1>
        <p className="text-sm text-slate-600">Monitor all mentees and identify who needs mentor intervention.</p>
      </div>

      <form className="ui-card grid gap-3 p-4 md:grid-cols-4">
        <select name="range" defaultValue={performance.filters.range} className="ui-input text-sm">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
        <input name="subject" defaultValue={performance.filters.subject ?? ""} placeholder="Filter by subject" className="ui-input text-sm" />
        <select name="limit" defaultValue={String(performance.filters.limit)} className="ui-input text-sm">
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
        <button type="submit" className="ui-btn-primary text-sm font-medium">Apply Filters</button>
      </form>

      <div className="ui-card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Mentee</th>
              <th className="px-4 py-3 font-medium">Submissions</th>
              <th className="px-4 py-3 font-medium">Reviewed</th>
              <th className="px-4 py-3 font-medium">Pending</th>
              <th className="px-4 py-3 font-medium">Average Score</th>
              <th className="px-4 py-3 font-medium">Last Submission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {performance.items.map((item) => (
              <tr key={item.menteeId}>
                <td className="px-4 py-3">
                  <Link href={`/admin/performance/${item.menteeId}?range=${performance.filters.range}${performance.filters.subject ? `&subject=${encodeURIComponent(performance.filters.subject)}` : ""}`} className="font-medium text-slate-900 underline">
                    {item.menteeName}
                  </Link>
                  <p className="text-xs text-slate-500">{item.menteeEmail}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{item.totalSubmissions}</td>
                <td className="px-4 py-3 text-slate-700">{item.reviewedSubmissions}</td>
                <td className="px-4 py-3 text-slate-700">{item.pendingReviews}</td>
                <td className="px-4 py-3 text-slate-700">{item.averageScore ?? "-"}</td>
                <td className="px-4 py-3 text-slate-500">{item.lastSubmittedAt ? new Date(item.lastSubmittedAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-700">
        <p>Page {performance.meta.page} of {performance.meta.totalPages}</p>
        <div className="flex gap-2">
          <Link href={`/admin/performance?page=${previousPage}&limit=${performance.meta.limit}&range=${performance.filters.range}${performance.filters.subject ? `&subject=${encodeURIComponent(performance.filters.subject)}` : ""}`} className={`rounded border border-slate-300 px-3 py-1.5 ${performance.meta.page === 1 ? "pointer-events-none opacity-50" : ""}`} aria-disabled={performance.meta.page === 1}>Previous</Link>
          <Link href={`/admin/performance?page=${nextPage}&limit=${performance.meta.limit}&range=${performance.filters.range}${performance.filters.subject ? `&subject=${encodeURIComponent(performance.filters.subject)}` : ""}`} className={`rounded border border-slate-300 px-3 py-1.5 ${performance.meta.page === performance.meta.totalPages ? "pointer-events-none opacity-50" : ""}`} aria-disabled={performance.meta.page === performance.meta.totalPages}>Next</Link>
        </div>
      </div>
    </section>
  );
}
