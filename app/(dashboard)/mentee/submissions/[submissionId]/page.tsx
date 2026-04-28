import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { getMenteeSubmissionDetailService } from "@/services/submission-view.service";

interface MenteeSubmissionDetailPageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function MenteeSubmissionDetailPage({ params }: MenteeSubmissionDetailPageProps) {
  const session = await requireRole(["mentee", "admin"]);
  const { submissionId } = await params;

  const detail = await getMenteeSubmissionDetailService({
    submissionId,
    menteeId: session.user.id,
  });

  if (!detail) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Submission Detail</h1>
        <Link href="/mentee" className="text-sm text-slate-700 underline">
          Back to dashboard
        </Link>
      </div>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Exam Context</h2>
        <p className="text-sm text-slate-600">{detail.exam?.title ?? "Unknown exam"}</p>
        <p className="text-sm text-slate-600">
          {detail.exam?.subject ?? "Unknown subject"} - {detail.exam?.topic ?? "Unknown topic"}
        </p>
      </article>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Prompt</h2>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {detail.question?.prompt ?? "Prompt unavailable."}
        </p>
      </article>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Your Answer</h2>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{detail.submission.answer}</p>
      </article>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Mentor Feedback</h2>
        {!detail.feedback ? (
          <p className="text-sm text-slate-600">No feedback yet for this submission.</p>
        ) : (
          <>
            <p className="text-sm text-slate-700">
              Reviewed by {detail.mentor?.name ?? "Mentor"} ({detail.feedback.score}/100)
            </p>
            <p className="text-sm text-slate-700">
              CLR: Conclusion {detail.feedback.clr.conclusion}, Law {detail.feedback.clr.law}, Reasoning{" "}
              {detail.feedback.clr.reasoning}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{detail.feedback.comments}</p>
          </>
        )}
      </article>
    </section>
  );
}
