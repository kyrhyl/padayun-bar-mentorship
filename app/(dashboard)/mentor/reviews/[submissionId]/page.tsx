import Link from "next/link";
import { notFound } from "next/navigation";

import { saveFeedbackAction } from "@/app/(dashboard)/mentor/actions";
import { RichFeedbackEditor } from "@/components/mentor/rich-feedback-editor";
import { RubricScoreColumn } from "@/components/mentor/rubric-score-column";
import { requireRole } from "@/lib/auth/authorization";
import { getReviewContextService } from "@/services/mentor-review.service";

interface MentorReviewPageProps {
  params: Promise<{ submissionId: string }>;
}

function resolveRubric(feedback: {
  rubric?: { correctResponse: number; law: number; reasoning: number; logic: number; grammar: number };
  clr?: { conclusion: number; law: number; reasoning: number };
} | null) {
  if (feedback?.rubric) {
    return feedback.rubric;
  }

  if (feedback?.clr) {
    return {
      correctResponse: Math.max(0, Math.min(1, feedback.clr.conclusion / 5)),
      law: Math.max(0, Math.min(1, feedback.clr.law / 5)),
      reasoning: Math.max(0, Math.min(1, feedback.clr.reasoning / 5)),
      logic: 0.75,
      grammar: 0.75,
    };
  }

  return {
    correctResponse: 0.75,
    law: 0.75,
    reasoning: 0.75,
    logic: 0.75,
    grammar: 0.75,
  };
}

export default async function MentorReviewPage({ params }: MentorReviewPageProps) {
  const session = await requireRole(["mentor", "admin"]);
  const { submissionId } = await params;

  const context = await getReviewContextService(session.user.id, submissionId);
  if (!context) {
    notFound();
  }

  const answerMap = new Map(
    (context.submission.answers ?? []).map((item) => [item.questionId, item.answer]),
  );
  const rubric = resolveRubric(context.feedback as { rubric?: { correctResponse: number; law: number; reasoning: number; logic: number; grammar: number }; clr?: { conclusion: number; law: number; reasoning: number } } | null);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">Review Submission</h1>
        <Link href="/mentor" className="text-sm text-slate-700 underline">
          Back to pending reviews
        </Link>
      </div>

      <article className="space-y-2 rounded-2xl border border-neutral-300 bg-gradient-to-b from-white to-neutral-100 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-slate-900">Submission Context</h2>
        <p className="text-sm text-slate-600">
          Mentee: {context.mentee?.name ?? "Unknown"} ({context.mentee?.email ?? "n/a"})
        </p>
        <p className="text-sm text-slate-600">
          Exam: {context.exam.title} - {context.exam.subject} - {context.exam.topic}
        </p>
        <p className="text-sm text-slate-700">{context.exam.instructions}</p>
      </article>

      <form action={saveFeedbackAction} className="space-y-4 rounded-2xl border border-neutral-300 bg-white p-5 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
        <input type="hidden" name="submissionId" value={context.submission._id.toString()} />

        <h2 className="text-lg font-semibold text-slate-900">Per-Question Review (0.25 steps)</h2>

        <div className="space-y-4">
          {context.questions.map((question, index) => {
            const questionId = question._id.toString();
            const answer = answerMap.get(questionId) ?? (index === 0 ? context.submission.answer : "");

            return (
              <article key={questionId} className="space-y-3.5 rounded-2xl border border-neutral-300 bg-gradient-to-b from-white to-neutral-100 p-4">
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold tracking-tight text-neutral-950">Question {index + 1}</h3>
                  <p className="whitespace-pre-wrap text-[15px] leading-6 text-neutral-700">{question.prompt}</p>
                </div>

                <div className="grid gap-4 border-t border-neutral-300 pt-3 md:grid-cols-2">
                  <div className="space-y-2 rounded-xl border border-neutral-300 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-neutral-600 uppercase">Mentee's Answer</p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-900">{answer || "-"}</p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-neutral-300 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-neutral-600 uppercase">Mentor's Feedback</p>

                    <label className="block text-xs text-neutral-700">
                      <RichFeedbackEditor
                        name="comments"
                        defaultValue={context.feedback?.comments ?? ""}
                        placeholder="Write mentor feedback for this answer..."
                      />
                    </label>

                    <RubricScoreColumn
                      criteria={[
                        {
                          key: "correctResponse",
                          label: "Correct Response (0-1)",
                          min: 0,
                          max: 1,
                          defaultValue: rubric.correctResponse,
                          step: 1,
                        },
                        {
                          key: "law",
                          label: "Law (0-1)",
                          min: 0,
                          max: 1,
                          defaultValue: rubric.law,
                        },
                        {
                          key: "reasoning",
                          label: "Reasoning (0-1)",
                          min: 0,
                          max: 1,
                          defaultValue: Math.min(rubric.reasoning, 1),
                        },
                        {
                          key: "logic",
                          label: "Logic (0-1)",
                          min: 0,
                          max: 1,
                          defaultValue: rubric.logic,
                        },
                        {
                          key: "grammar",
                          label: "Grammar (0-1)",
                          min: 0,
                          max: 1,
                          defaultValue: rubric.grammar,
                        },
                      ]}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-neutral-800"
        >
          Save Feedback
        </button>
      </form>
    </section>
  );
}
