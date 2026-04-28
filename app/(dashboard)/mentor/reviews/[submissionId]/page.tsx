import Link from "next/link";
import { notFound } from "next/navigation";

import { saveFeedbackAction } from "@/app/(dashboard)/mentor/actions";
import { requireRole } from "@/lib/auth/authorization";
import { getReviewContextService } from "@/services/mentor-review.service";

interface MentorReviewPageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function MentorReviewPage({ params }: MentorReviewPageProps) {
  const session = await requireRole(["mentor", "admin"]);
  const { submissionId } = await params;

  const context = await getReviewContextService(session.user.id, submissionId);
  if (!context) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Review Submission</h1>
        <Link href="/mentor" className="text-sm text-slate-700 underline">
          Back to pending reviews
        </Link>
      </div>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Submission Context</h2>
        <p className="text-sm text-slate-600">
          Mentee: {context.mentee?.name ?? "Unknown"} ({context.mentee?.email ?? "n/a"})
        </p>
        <p className="text-sm text-slate-600">
          Exam: {context.exam.title} - {context.exam.subject} - {context.exam.topic}
        </p>
        <p className="text-sm text-slate-700">{context.exam.instructions}</p>
      </article>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Prompt</h2>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{context.question.prompt}</p>
      </article>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Submitted Answer</h2>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{context.submission.answer}</p>
      </article>

      <form action={saveFeedbackAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <input type="hidden" name="submissionId" value={context.submission._id.toString()} />

        <h2 className="text-lg font-semibold text-slate-900">CLR Grading</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm text-slate-700">
            Conclusion (0-100)
            <input
              name="conclusion"
              type="number"
              min={0}
              max={100}
              defaultValue={context.feedback?.clr.conclusion ?? 70}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm text-slate-700">
            Law (0-100)
            <input
              name="law"
              type="number"
              min={0}
              max={100}
              defaultValue={context.feedback?.clr.law ?? 70}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm text-slate-700">
            Reasoning (0-100)
            <input
              name="reasoning"
              type="number"
              min={0}
              max={100}
              defaultValue={context.feedback?.clr.reasoning ?? 70}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="block text-sm text-slate-700">
          Feedback Comments
          <textarea
            name="comments"
            required
            minLength={10}
            rows={7}
            defaultValue={context.feedback?.comments ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Save Feedback
        </button>
      </form>
    </section>
  );
}
