import Link from "next/link";

import { ExamPagination } from "@/components/exams/exam-pagination";
import { requireRole } from "@/lib/auth/authorization";
import { BAR_SUBJECT_OPTIONS } from "@/lib/constants/bar-subjects";
import { listPublishedExamsService } from "@/services/exam.service";

interface MenteeExamsPageProps {
  searchParams: Promise<{
    subject?: string;
    examPage?: string;
    examLimit?: string;
  }>;
}

export default async function MenteeExamsPage({ searchParams }: MenteeExamsPageProps) {
  await requireRole(["mentee", "admin"]);
  const params = await searchParams;

  const exams = await listPublishedExamsService({
    subject: params.subject,
    page: params.examPage,
    limit: params.examLimit,
  });
  const subjectOptions = exams.filters.subject
    ? Array.from(new Set([...BAR_SUBJECT_OPTIONS, exams.filters.subject]))
    : BAR_SUBJECT_OPTIONS;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Exams</h1>
        <p className="text-sm text-slate-600">Find published exams and start timed essay drills.</p>
      </div>

      <form className="ui-card flex flex-wrap items-center gap-2.5 p-3">
        <select
          name="subject"
          defaultValue={exams.filters.subject ?? ""}
          className="ui-input h-9 min-w-[220px] flex-1 text-sm"
        >
          <option value="">All subjects</option>
          {subjectOptions.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <select
          name="examLimit"
          defaultValue={String(exams.filters.limit)}
          className="ui-input h-9 w-[130px] text-sm"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
        <button type="submit" className="ui-btn-primary h-9 px-3 text-sm font-medium whitespace-nowrap">
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
            <article key={exam._id.toString()} className="ui-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">{exam.title}</h2>
                  <p className="text-sm text-slate-600">
                    {exam.subject} - {exam.topic} - {exam.durationMinutes} minutes
                  </p>
                </div>
                <Link href={`/mentee/exams/${exam._id.toString()}`} className="ui-btn-primary text-sm font-medium">
                  Start Exam
                </Link>
              </div>
            </article>
          ))
        )}
      </div>

      <ExamPagination
        meta={exams.meta}
        pathname="/mentee/exams"
        pageParam="examPage"
        query={{
          subject: exams.filters.subject,
          examLimit: String(exams.filters.limit),
        }}
      />
    </section>
  );
}
