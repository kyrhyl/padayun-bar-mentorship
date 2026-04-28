import Link from "next/link";

import { requireRole } from "@/lib/auth/authorization";
import { getMentorDashboardService } from "@/services/dashboard.service";
import { listPendingReviewsService } from "@/services/mentor-review.service";

interface MentorPageProps {
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

export default async function MentorPage({ searchParams }: MentorPageProps) {
  const session = await requireRole(["mentor", "admin"]);
  const params = await searchParams;

  const pending = await listPendingReviewsService(session.user.id, {
    page: params.pendingPage,
    limit: params.pendingLimit,
    menteeId: params.pendingMenteeId,
    subject: params.pendingSubject,
  });

  const dashboard = await getMentorDashboardService(session.user.id, {
    page: params.reviewedPage,
    limit: params.reviewedLimit,
    menteeId: params.reviewedMenteeId,
    subject: params.reviewedSubject,
  });

  const previousPage = Math.max(1, pending.meta.page - 1);
  const nextPage = Math.min(pending.meta.totalPages, pending.meta.page + 1);
  const previousReviewedPage = Math.max(1, dashboard.reviewedMeta.page - 1);
  const nextReviewedPage = Math.min(dashboard.reviewedMeta.totalPages, dashboard.reviewedMeta.page + 1);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Mentor Workspace</h1>
      <p className="text-sm text-slate-600">
        Review submitted essays from assigned mentees and score via CLR breakdown.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Assigned mentees</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dashboard.assignedMentees.length}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Pending reviews</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboard.pendingReviews}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Reviewed entries</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dashboard.reviewedMeta.totalItems}
          </p>
        </article>
      </div>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Assigned Mentees</h2>
        {dashboard.assignedMentees.length === 0 ? (
          <p className="text-sm text-slate-600">No mentees assigned.</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-700">
            {dashboard.assignedMentees.map((mentee) => (
              <li key={mentee.id}>
                {mentee.name} ({mentee.email})
              </li>
            ))}
          </ul>
        )}
      </article>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select
          name="pendingMenteeId"
          defaultValue={pending.filters.menteeId ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All mentees</option>
          {dashboard.assignedMentees.map((mentee) => (
            <option key={mentee.id} value={mentee.id}>
              {mentee.name}
            </option>
          ))}
        </select>
        <input
          name="pendingSubject"
          defaultValue={pending.filters.subject ?? ""}
          placeholder="Filter by subject"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input type="hidden" name="reviewedPage" value={String(dashboard.reviewedMeta.page)} />
        <input type="hidden" name="reviewedLimit" value={String(dashboard.reviewedMeta.limit)} />
        <input type="hidden" name="reviewedMenteeId" value={dashboard.reviewedFilters.menteeId ?? ""} />
        <input type="hidden" name="reviewedSubject" value={dashboard.reviewedFilters.subject ?? ""} />
        <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
          Apply Filters
        </button>
      </form>

      {pending.items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
          No pending reviews right now.
        </div>
      ) : (
        <div className="space-y-3">
          {pending.items.map((item) => (
            <article key={item.submissionId} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
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
            href={`/mentor?pendingPage=${previousPage}&pendingLimit=${pending.filters.limit}&reviewedPage=${dashboard.reviewedMeta.page}&reviewedLimit=${dashboard.reviewedMeta.limit}${pending.filters.menteeId ? `&pendingMenteeId=${encodeURIComponent(pending.filters.menteeId)}` : ""}${pending.filters.subject ? `&pendingSubject=${encodeURIComponent(pending.filters.subject)}` : ""}${dashboard.reviewedFilters.menteeId ? `&reviewedMenteeId=${encodeURIComponent(dashboard.reviewedFilters.menteeId)}` : ""}${dashboard.reviewedFilters.subject ? `&reviewedSubject=${encodeURIComponent(dashboard.reviewedFilters.subject)}` : ""}`}
            className={`rounded border border-slate-300 px-3 py-1.5 ${
              pending.meta.page === 1 ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={pending.meta.page === 1}
          >
            Previous
          </Link>
          <Link
            href={`/mentor?pendingPage=${nextPage}&pendingLimit=${pending.filters.limit}&reviewedPage=${dashboard.reviewedMeta.page}&reviewedLimit=${dashboard.reviewedMeta.limit}${pending.filters.menteeId ? `&pendingMenteeId=${encodeURIComponent(pending.filters.menteeId)}` : ""}${pending.filters.subject ? `&pendingSubject=${encodeURIComponent(pending.filters.subject)}` : ""}${dashboard.reviewedFilters.menteeId ? `&reviewedMenteeId=${encodeURIComponent(dashboard.reviewedFilters.menteeId)}` : ""}${dashboard.reviewedFilters.subject ? `&reviewedSubject=${encodeURIComponent(dashboard.reviewedFilters.subject)}` : ""}`}
            className={`rounded border border-slate-300 px-3 py-1.5 ${
              pending.meta.page === pending.meta.totalPages ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={pending.meta.page === pending.meta.totalPages}
          >
            Next
          </Link>
        </div>
      </div>

      <article className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Recently Reviewed</h2>
        <form className="grid gap-3 md:grid-cols-4">
          <select
            name="reviewedMenteeId"
            defaultValue={dashboard.reviewedFilters.menteeId ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All mentees</option>
            {dashboard.assignedMentees.map((mentee) => (
              <option key={mentee.id} value={mentee.id}>
                {mentee.name}
              </option>
            ))}
          </select>
          <input
            name="reviewedSubject"
            defaultValue={dashboard.reviewedFilters.subject ?? ""}
            placeholder="Filter by subject"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input type="hidden" name="pendingPage" value={String(pending.meta.page)} />
          <input type="hidden" name="pendingLimit" value={String(pending.meta.limit)} />
          <input type="hidden" name="pendingMenteeId" value={pending.filters.menteeId ?? ""} />
          <input type="hidden" name="pendingSubject" value={pending.filters.subject ?? ""} />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
            Apply Filters
          </button>
        </form>
        {dashboard.recentReviewed.length === 0 ? (
          <p className="text-sm text-slate-600">No reviewed submissions yet.</p>
        ) : (
          dashboard.recentReviewed.map((item) => (
            <div
              key={item.submissionId}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 p-3 text-sm"
            >
              <p className="text-slate-700">Submission: {item.submissionId}</p>
              <p className="text-slate-700">Score: {item.score}</p>
              <p className="text-slate-500">Updated: {new Date(item.updatedAt).toLocaleString()}</p>
            </div>
          ))
        )}

        <div className="flex items-center justify-between text-sm text-slate-700">
          <p>
            Page {dashboard.reviewedMeta.page} of {dashboard.reviewedMeta.totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/mentor?pendingPage=${pending.meta.page}&pendingLimit=${pending.meta.limit}&reviewedPage=${previousReviewedPage}&reviewedLimit=${dashboard.reviewedMeta.limit}${pending.filters.menteeId ? `&pendingMenteeId=${encodeURIComponent(pending.filters.menteeId)}` : ""}${pending.filters.subject ? `&pendingSubject=${encodeURIComponent(pending.filters.subject)}` : ""}${dashboard.reviewedFilters.menteeId ? `&reviewedMenteeId=${encodeURIComponent(dashboard.reviewedFilters.menteeId)}` : ""}${dashboard.reviewedFilters.subject ? `&reviewedSubject=${encodeURIComponent(dashboard.reviewedFilters.subject)}` : ""}`}
              className={`rounded border border-slate-300 px-3 py-1.5 ${
                dashboard.reviewedMeta.page === 1 ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={dashboard.reviewedMeta.page === 1}
            >
              Previous
            </Link>
            <Link
              href={`/mentor?pendingPage=${pending.meta.page}&pendingLimit=${pending.meta.limit}&reviewedPage=${nextReviewedPage}&reviewedLimit=${dashboard.reviewedMeta.limit}${pending.filters.menteeId ? `&pendingMenteeId=${encodeURIComponent(pending.filters.menteeId)}` : ""}${pending.filters.subject ? `&pendingSubject=${encodeURIComponent(pending.filters.subject)}` : ""}${dashboard.reviewedFilters.menteeId ? `&reviewedMenteeId=${encodeURIComponent(dashboard.reviewedFilters.menteeId)}` : ""}${dashboard.reviewedFilters.subject ? `&reviewedSubject=${encodeURIComponent(dashboard.reviewedFilters.subject)}` : ""}`}
              className={`rounded border border-slate-300 px-3 py-1.5 ${
                dashboard.reviewedMeta.page === dashboard.reviewedMeta.totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
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
