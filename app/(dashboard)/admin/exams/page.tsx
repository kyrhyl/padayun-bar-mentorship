import Link from "next/link";

import {
  deleteExamAction,
  regenerateExamQuestionsAction,
  togglePublishExamAction,
} from "@/app/(dashboard)/admin/exams/actions";
import { requireRole } from "@/lib/auth/authorization";
import { listExamsForAdminService } from "@/services/exam.service";

interface AdminExamsPageProps {
  searchParams: Promise<{ subject?: string; topic?: string; page?: string; limit?: string; success?: string; error?: string }>;
}

export default async function AdminExamsPage({ searchParams }: AdminExamsPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const exams = await listExamsForAdminService(params);
  const previousPage = Math.max(1, exams.meta.page - 1);
  const nextPage = Math.min(exams.meta.totalPages, exams.meta.page + 1);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Exam Management</h1>
        <Link href="/admin/exams/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
          New Exam
        </Link>
      </div>

      {params.success === "regenerated" ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Question set regenerated successfully.
        </p>
      ) : null}
      {params.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          name="subject"
          defaultValue={exams.filters.subject ?? ""}
          placeholder="Filter by subject"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="topic"
          defaultValue={exams.filters.topic ?? ""}
          placeholder="Filter by topic"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          name="limit"
          defaultValue={String(exams.filters.limit)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
        <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
          Apply Filters
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Subject/Topic</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Question Set</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exams.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No exams found.
                </td>
              </tr>
            ) : (
              exams.items.map((exam) => (
                <tr key={exam._id.toString()} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{exam.title}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {exam.subject} - {exam.topic}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{exam.durationMinutes} min</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        exam.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {exam.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    {exam.questionMode === "random_pool"
                      ? exam.poolNeedsRegeneration
                        ? "Needs regeneration"
                        : exam.generatedQuestionIds?.length
                          ? `Generated (${exam.generatedQuestionIds.length})`
                          : "Not generated"
                      : `${exam.questionIds?.length ?? (exam.questionId ? 1 : 0)} selected`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4 whitespace-nowrap">
                      <Link href={`/admin/exams/${exam._id.toString()}/edit`} className="underline">
                        Edit
                      </Link>
                      <form action={togglePublishExamAction.bind(null, exam._id.toString(), !exam.isPublished)}>
                        <button type="submit" className="underline text-slate-700">
                          {exam.isPublished ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      {exam.questionMode === "random_pool" ? (
                        exam.isPublished ? (
                          <span className="text-xs text-slate-500">Unpublish to regenerate</span>
                        ) : (
                          <form action={regenerateExamQuestionsAction.bind(null, exam._id.toString())}>
                            <button type="submit" className="underline text-slate-700">
                              Regenerate
                            </button>
                          </form>
                        )
                      ) : null}
                      <form action={deleteExamAction.bind(null, exam._id.toString())}>
                        <button type="submit" className="underline text-red-700">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-700">
        <p>
          Page {exams.meta.page} of {exams.meta.totalPages} ({exams.meta.totalItems} total)
        </p>
        <div className="flex gap-2">
          <Link
            href={`/admin/exams?page=${previousPage}&limit=${exams.filters.limit}${exams.filters.subject ? `&subject=${encodeURIComponent(exams.filters.subject)}` : ""}${exams.filters.topic ? `&topic=${encodeURIComponent(exams.filters.topic)}` : ""}`}
            className={`rounded border border-slate-300 px-3 py-1.5 ${
              exams.meta.page === 1 ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={exams.meta.page === 1}
          >
            Previous
          </Link>
          <Link
            href={`/admin/exams?page=${nextPage}&limit=${exams.filters.limit}${exams.filters.subject ? `&subject=${encodeURIComponent(exams.filters.subject)}` : ""}${exams.filters.topic ? `&topic=${encodeURIComponent(exams.filters.topic)}` : ""}`}
            className={`rounded border border-slate-300 px-3 py-1.5 ${
              exams.meta.page === exams.meta.totalPages ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={exams.meta.page === exams.meta.totalPages}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
