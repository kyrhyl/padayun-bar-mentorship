import Link from "next/link";

import { requireRole } from "@/lib/auth/authorization";
import { getAdminMenteePerformanceDetailService } from "@/services/performance.service";

interface AdminMenteePerformancePageProps {
  params: Promise<{ menteeId: string }>;
  searchParams: Promise<{ range?: string; subject?: string }>;
}

export default async function AdminMenteePerformancePage({
  params,
  searchParams,
}: AdminMenteePerformancePageProps) {
  await requireRole(["admin"]);
  const { menteeId } = await params;
  const query = await searchParams;

  const details = await getAdminMenteePerformanceDetailService(menteeId, {
    range: query.range,
    subject: query.subject,
  });

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <Link href="/admin/performance" className="text-sm text-slate-600 underline">Back to performance list</Link>
        <h1 className="text-2xl font-semibold text-slate-900">{details.menteeName}</h1>
        <p className="text-sm text-slate-600">{details.menteeEmail}</p>
      </div>

      <form className="ui-card grid gap-3 p-4 md:grid-cols-3">
        <select name="range" defaultValue={query.range ?? "30d"} className="ui-input text-sm">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
        <input name="subject" defaultValue={query.subject ?? ""} placeholder="Filter by subject" className="ui-input text-sm" />
        <button type="submit" className="ui-btn-primary text-sm font-medium">Apply Filters</button>
      </form>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="ui-card p-4"><h2 className="text-sm text-slate-600">Submissions</h2><p className="mt-2 text-2xl font-semibold text-slate-900">{details.totalSubmissions}</p></article>
        <article className="ui-card p-4"><h2 className="text-sm text-slate-600">Reviewed</h2><p className="mt-2 text-2xl font-semibold text-slate-900">{details.reviewedSubmissions}</p></article>
        <article className="ui-card p-4"><h2 className="text-sm text-slate-600">Pending</h2><p className="mt-2 text-2xl font-semibold text-slate-900">{details.pendingReviews}</p></article>
        <article className="ui-card p-4"><h2 className="text-sm text-slate-600">Average Score</h2><p className="mt-2 text-2xl font-semibold text-slate-900">{details.averageScore ?? "-"}</p></article>
      </div>

      <article className="ui-card space-y-2 p-4">
        <h2 className="text-lg font-semibold text-slate-900">Weak Subjects</h2>
        {details.weakSubjects.length === 0 ? <p className="text-sm text-slate-600">No graded submissions for selected filters.</p> : (
          <ul className="space-y-1 text-sm text-slate-700">{details.weakSubjects.map((item) => <li key={item.subject}>{item.subject}: average {item.averageScore}</li>)}</ul>
        )}
      </article>

      <article className="ui-card space-y-2 p-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Scores</h2>
        {details.recentScores.length === 0 ? <p className="text-sm text-slate-600">No reviewed submissions for selected filters.</p> : (
          <div className="space-y-2">{details.recentScores.map((item) => <div key={item.submissionId} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 p-3 text-sm"><p className="text-slate-700">Submission: {item.submissionId}</p><p className="text-slate-700">Score: {item.score}</p><p className="text-slate-500">Updated: {new Date(item.updatedAt).toLocaleString()}</p></div>)}</div>
        )}
      </article>
    </section>
  );
}
