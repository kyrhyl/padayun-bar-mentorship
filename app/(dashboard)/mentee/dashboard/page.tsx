import Link from "next/link";

import { requireRole } from "@/lib/auth/authorization";
import { getMenteeDashboardService } from "@/services/dashboard.service";

interface MenteeDashboardPageProps {
  searchParams: Promise<{
    submissionPage?: string;
    submissionLimit?: string;
  }>;
}

export default async function MenteeDashboardPage({ searchParams }: MenteeDashboardPageProps) {
  const session = await requireRole(["mentee", "admin"]);
  const params = await searchParams;

  const menteeDashboard = await getMenteeDashboardService(session.user.id, {
    page: params.submissionPage,
    limit: params.submissionLimit,
  });

  const previousSubmissionPage = Math.max(1, menteeDashboard.meta.page - 1);
  const nextSubmissionPage = Math.min(
    menteeDashboard.meta.totalPages,
    menteeDashboard.meta.page + 1,
  );

  return (
    <section className="space-y-3.5">
      <div className="space-y-0.5">
        <h1 className="text-xl font-semibold text-slate-900">Mentee Dashboard</h1>
        <p className="text-xs text-slate-600">
          Track scores, identify weak subjects, and monitor your submissions.
        </p>
      </div>

      <div className="grid gap-2.5 md:grid-cols-3">
        <article className="ui-card p-3">
          <h2 className="text-xs font-semibold text-slate-700">Total submissions</h2>
          <p className="mt-1 text-lg font-semibold text-slate-900">{menteeDashboard.meta.totalItems}</p>
        </article>
        <article className="ui-card p-3">
          <h2 className="text-xs font-semibold text-slate-700">Recent scored answers</h2>
          <p className="mt-1 text-lg font-semibold text-slate-900">{menteeDashboard.recentScores.length}</p>
        </article>
        <article className="ui-card p-3">
          <h2 className="text-xs font-semibold text-slate-700">Weak subjects tracked</h2>
          <p className="mt-1 text-lg font-semibold text-slate-900">{menteeDashboard.weakSubjects.length}</p>
        </article>
      </div>

      <article className="ui-card space-y-1 p-3">
        <h2 className="text-base font-semibold text-slate-900">Weak Subjects</h2>
        {menteeDashboard.weakSubjects.length === 0 ? (
          <p className="text-xs text-slate-600">No graded submissions yet.</p>
        ) : (
          <ul className="space-y-0.5 text-xs text-slate-700">
            {menteeDashboard.weakSubjects.map((item) => (
              <li key={item.subject}>
                {item.subject}: average {item.averageScore}
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="ui-card space-y-2 p-3.5">
        <h2 className="text-lg font-semibold text-slate-900">Recent Submissions</h2>
        {menteeDashboard.recentSubmissions.length === 0 ? (
          <p className="text-sm text-slate-600">No submissions yet.</p>
        ) : (
          <div className="space-y-1.5">
            {menteeDashboard.recentSubmissions.map((submission) => (
              <div
                key={submission._id.toString()}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 px-2.5 py-2 text-sm"
              >
                <Link
                  href={`/mentee/submissions/${submission._id.toString()}`}
                  className="text-slate-700 underline"
                >
                  Submission ID: {submission._id.toString()}
                </Link>
                <p className="text-slate-500">
                  {submission.isSubmitted
                    ? `Submitted ${submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : ""}`
                    : "Draft"}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-slate-700">
          <p>
            Page {menteeDashboard.meta.page} of {menteeDashboard.meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/mentee/dashboard?submissionPage=${previousSubmissionPage}&submissionLimit=${menteeDashboard.meta.limit}`}
              className={`rounded border border-slate-300 px-3 py-1.5 ${
                menteeDashboard.meta.page === 1 ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={menteeDashboard.meta.page === 1}
            >
              Previous
            </Link>
            <Link
              href={`/mentee/dashboard?submissionPage=${nextSubmissionPage}&submissionLimit=${menteeDashboard.meta.limit}`}
              className={`rounded border border-slate-300 px-3 py-1.5 ${
                menteeDashboard.meta.page === menteeDashboard.meta.totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
              aria-disabled={menteeDashboard.meta.page === menteeDashboard.meta.totalPages}
            >
              Next
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}
