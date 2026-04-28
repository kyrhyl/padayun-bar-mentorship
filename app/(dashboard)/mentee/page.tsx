import Link from "next/link";

import { ExamPagination } from "@/components/exams/exam-pagination";
import { requireRole } from "@/lib/auth/authorization";
import { getMenteeDashboardService } from "@/services/dashboard.service";
import { listPublishedExamsService } from "@/services/exam.service";

interface MenteePageProps {
  searchParams: Promise<{
    subject?: string;
    examPage?: string;
    examLimit?: string;
    submissionPage?: string;
    submissionLimit?: string;
  }>;
}

export default async function MenteePage({ searchParams }: MenteePageProps) {
  const session = await requireRole(["mentee", "admin"]);
  const params = await searchParams;

  const exams = await listPublishedExamsService({
    subject: params.subject,
    page: params.examPage,
    limit: params.examLimit,
  });

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
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Mentee Workspace</h1>
        <p className="text-sm text-slate-600">
          Track scores, identify weak subjects, and start timed essay drills.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Total submissions</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {menteeDashboard.meta.totalItems}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Recent scored answers</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {menteeDashboard.recentScores.length}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Weak subjects tracked</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {menteeDashboard.weakSubjects.length}
          </p>
        </article>
      </div>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Weak Subjects</h2>
        {menteeDashboard.weakSubjects.length === 0 ? (
          <p className="text-sm text-slate-600">No graded submissions yet.</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-700">
            {menteeDashboard.weakSubjects.map((item) => (
              <li key={item.subject}>
                {item.subject}: average {item.averageScore}
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Submissions</h2>
        {menteeDashboard.recentSubmissions.length === 0 ? (
          <p className="text-sm text-slate-600">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {menteeDashboard.recentSubmissions.map((submission) => (
              <div
                key={submission._id.toString()}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 p-3 text-sm"
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
              href={`/mentee?submissionPage=${previousSubmissionPage}&submissionLimit=${menteeDashboard.meta.limit}&examPage=${exams.meta.page}&examLimit=${exams.meta.limit}${params.subject ? `&subject=${encodeURIComponent(params.subject)}` : ""}`}
              className={`rounded border border-slate-300 px-3 py-1.5 ${
                menteeDashboard.meta.page === 1 ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={menteeDashboard.meta.page === 1}
            >
              Previous
            </Link>
            <Link
              href={`/mentee?submissionPage=${nextSubmissionPage}&submissionLimit=${menteeDashboard.meta.limit}&examPage=${exams.meta.page}&examLimit=${exams.meta.limit}${params.subject ? `&subject=${encodeURIComponent(params.subject)}` : ""}`}
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

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <input
          name="subject"
          defaultValue={exams.filters.subject ?? ""}
          placeholder="Filter by subject"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input type="hidden" name="submissionPage" value={String(menteeDashboard.meta.page)} />
        <input type="hidden" name="submissionLimit" value={String(menteeDashboard.meta.limit)} />
        <select
          name="examLimit"
          defaultValue={String(exams.filters.limit)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Apply Filters
        </button>
      </form>

      <div className="space-y-3">
        {exams.items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No published exams yet.
          </div>
        ) : (
          exams.items.map((exam) => (
            <article key={exam._id.toString()} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">{exam.title}</h2>
                  <p className="text-sm text-slate-600">
                    {exam.subject} - {exam.topic} - {exam.durationMinutes} minutes
                  </p>
                </div>
                <Link
                  href={`/mentee/exams/${exam._id.toString()}`}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Start Exam
                </Link>
              </div>
            </article>
          ))
        )}
      </div>

      <ExamPagination
        meta={exams.meta}
        pathname="/mentee"
        pageParam="examPage"
        query={{
          subject: exams.filters.subject,
          examLimit: String(exams.filters.limit),
          submissionPage: String(menteeDashboard.meta.page),
          submissionLimit: String(menteeDashboard.meta.limit),
        }}
      />
    </section>
  );
}
