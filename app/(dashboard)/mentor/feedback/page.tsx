import Link from "next/link";

import { requireRole } from "@/lib/auth/authorization";
import { getMentorDashboardService } from "@/services/dashboard.service";
import { listPendingReviewsService } from "@/services/mentor-review.service";

interface MentorFeedbackPageProps {
  searchParams: Promise<{
    pendingPage?: string;
    pendingLimit?: string;
    pendingMenteeId?: string;
    pendingSubject?: string;
    reviewedPage?: string;
    reviewedLimit?: string;
    reviewedMenteeId?: string;
    reviewedSubject?: string;
  }>;
}

export default async function MentorFeedbackPage({ searchParams }: MentorFeedbackPageProps) {
  const session = await requireRole(["mentor", "admin"]);
  const params = await searchParams;

  const [pending, dashboard] = await Promise.all([
    listPendingReviewsService(session.user.id, {
      page: params.pendingPage,
      limit: params.pendingLimit,
      menteeId: params.pendingMenteeId,
      subject: params.pendingSubject,
    }),
    getMentorDashboardService(session.user.id, {
      page: params.reviewedPage,
      limit: params.reviewedLimit,
      menteeId: params.reviewedMenteeId,
      subject: params.reviewedSubject,
    }),
  ]);

  const previousPendingPage = Math.max(1, pending.meta.page - 1);
  const nextPendingPage = Math.min(pending.meta.totalPages, pending.meta.page + 1);
  const previousReviewedPage = Math.max(1, dashboard.reviewedMeta.page - 1);
  const nextReviewedPage = Math.min(dashboard.reviewedMeta.totalPages, dashboard.reviewedMeta.page + 1);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Feedback</h1>
        <p className="text-sm text-slate-600">Submitted exams from your mentees that are ready for feedback.</p>
      </div>

      {pending.items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
          No submitted exams waiting for feedback right now.
        </div>
      ) : (
        <div className="space-y-3">
          {pending.items.map((item) => (
            <article key={item.submissionId} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{item.examTitle}</h2>
                  <p className="text-sm text-slate-600">
                    {item.menteeName} - {item.subject} - {item.topic}
                  </p>
                  <p className="text-xs text-slate-500">
                    Submitted: {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "N/A"}
                  </p>
                </div>

                <Link
                  href={`/mentor/reviews/${item.submissionId}`}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Review Submission
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-slate-700">
        <p>
          Page {pending.meta.page} of {pending.meta.totalPages} ({pending.meta.totalItems} pending)
        </p>
        <div className="flex gap-2">
          <Link
            href={`/mentor/feedback?pendingPage=${previousPendingPage}&pendingLimit=${pending.filters.limit}&reviewedPage=${dashboard.reviewedMeta.page}&reviewedLimit=${dashboard.reviewedMeta.limit}${pending.filters.menteeId ? `&pendingMenteeId=${encodeURIComponent(pending.filters.menteeId)}` : ""}${pending.filters.subject ? `&pendingSubject=${encodeURIComponent(pending.filters.subject)}` : ""}${dashboard.reviewedFilters.menteeId ? `&reviewedMenteeId=${encodeURIComponent(dashboard.reviewedFilters.menteeId)}` : ""}${dashboard.reviewedFilters.subject ? `&reviewedSubject=${encodeURIComponent(dashboard.reviewedFilters.subject)}` : ""}`}
            className={`rounded border border-slate-300 px-3 py-1.5 ${pending.meta.page === 1 ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={pending.meta.page === 1}
          >
            Previous
          </Link>
          <Link
            href={`/mentor/feedback?pendingPage=${nextPendingPage}&pendingLimit=${pending.filters.limit}&reviewedPage=${dashboard.reviewedMeta.page}&reviewedLimit=${dashboard.reviewedMeta.limit}${pending.filters.menteeId ? `&pendingMenteeId=${encodeURIComponent(pending.filters.menteeId)}` : ""}${pending.filters.subject ? `&pendingSubject=${encodeURIComponent(pending.filters.subject)}` : ""}${dashboard.reviewedFilters.menteeId ? `&reviewedMenteeId=${encodeURIComponent(dashboard.reviewedFilters.menteeId)}` : ""}${dashboard.reviewedFilters.subject ? `&reviewedSubject=${encodeURIComponent(dashboard.reviewedFilters.subject)}` : ""}`}
            className={`rounded border border-slate-300 px-3 py-1.5 ${pending.meta.page === pending.meta.totalPages ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={pending.meta.page === pending.meta.totalPages}
          >
            Next
          </Link>
        </div>
      </div>

      <article className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Graded Exams</h2>
        {dashboard.recentReviewed.length === 0 ? (
          <p className="text-sm text-slate-600">No graded exams yet.</p>
        ) : (
          dashboard.recentReviewed.map((item) => (
            <div
              key={item.submissionId}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 p-3 text-sm"
            >
              <p className="text-slate-700">Submission: {item.submissionId}</p>
              <p className="text-slate-700">Score: {item.score}</p>
              <p className="text-slate-500">Updated: {new Date(item.updatedAt).toLocaleString()}</p>
              <div className="ml-auto flex items-center gap-3">
                <Link href={`/mentor/reviews/${item.submissionId}`} className="text-slate-700 underline">
                  View
                </Link>
                <Link href={`/mentor/reviews/${item.submissionId}`} className="font-medium text-slate-900 underline">
                  Modify
                </Link>
              </div>
            </div>
          ))
        )}

        <div className="flex items-center justify-between text-sm text-slate-700">
          <p>
            Page {dashboard.reviewedMeta.page} of {dashboard.reviewedMeta.totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/mentor/feedback?pendingPage=${pending.meta.page}&pendingLimit=${pending.meta.limit}&reviewedPage=${previousReviewedPage}&reviewedLimit=${dashboard.reviewedMeta.limit}${pending.filters.menteeId ? `&pendingMenteeId=${encodeURIComponent(pending.filters.menteeId)}` : ""}${pending.filters.subject ? `&pendingSubject=${encodeURIComponent(pending.filters.subject)}` : ""}${dashboard.reviewedFilters.menteeId ? `&reviewedMenteeId=${encodeURIComponent(dashboard.reviewedFilters.menteeId)}` : ""}${dashboard.reviewedFilters.subject ? `&reviewedSubject=${encodeURIComponent(dashboard.reviewedFilters.subject)}` : ""}`}
              className={`rounded border border-slate-300 px-3 py-1.5 ${dashboard.reviewedMeta.page === 1 ? "pointer-events-none opacity-50" : ""}`}
              aria-disabled={dashboard.reviewedMeta.page === 1}
            >
              Previous
            </Link>
            <Link
              href={`/mentor/feedback?pendingPage=${pending.meta.page}&pendingLimit=${pending.meta.limit}&reviewedPage=${nextReviewedPage}&reviewedLimit=${dashboard.reviewedMeta.limit}${pending.filters.menteeId ? `&pendingMenteeId=${encodeURIComponent(pending.filters.menteeId)}` : ""}${pending.filters.subject ? `&pendingSubject=${encodeURIComponent(pending.filters.subject)}` : ""}${dashboard.reviewedFilters.menteeId ? `&reviewedMenteeId=${encodeURIComponent(dashboard.reviewedFilters.menteeId)}` : ""}${dashboard.reviewedFilters.subject ? `&reviewedSubject=${encodeURIComponent(dashboard.reviewedFilters.subject)}` : ""}`}
              className={`rounded border border-slate-300 px-3 py-1.5 ${dashboard.reviewedMeta.page === dashboard.reviewedMeta.totalPages ? "pointer-events-none opacity-50" : ""}`}
              aria-disabled={dashboard.reviewedMeta.page === dashboard.reviewedMeta.totalPages}
            >
              Next
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}
