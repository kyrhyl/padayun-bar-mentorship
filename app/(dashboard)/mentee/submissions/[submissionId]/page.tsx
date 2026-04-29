import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { getMenteeSubmissionDetailService } from "@/services/submission-view.service";

interface MenteeSubmissionDetailPageProps {
  params: Promise<{ submissionId: string }>;
}

function parsePerQuestionComments(comments: string | undefined, questionCount: number): string[] {
  if (!questionCount) {
    return [];
  }

  const parsed = Array.from({ length: questionCount }, () => "");
  const source = (comments ?? "").trim();
  if (!source) {
    return parsed;
  }

  const regex = /Q(\d+):\s*([\s\S]*?)(?=\n\nQ\d+:|$)/g;
  let found = false;
  for (const match of source.matchAll(regex)) {
    found = true;
    const index = Number(match[1]) - 1;
    if (index >= 0 && index < parsed.length) {
      parsed[index] = match[2].trim();
    }
  }

  if (!found) {
    parsed[0] = source;
  }

  return parsed;
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
      logic: 0,
      grammar: 0,
    };
  }

  return null;
}

function sanitizeFeedbackHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
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

  const answerMap = new Map(
    (detail.submission.answers ?? []).map((item) => [item.questionId, item.answer]),
  );
  const commentsByQuestion = parsePerQuestionComments(detail.feedback?.comments, detail.questions.length);
  const rubric = resolveRubric(detail.feedback as { rubric?: { correctResponse: number; law: number; reasoning: number; logic: number; grammar: number }; clr?: { conclusion: number; law: number; reasoning: number } } | null);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Submission Detail</h1>
        <Link href="/mentee/dashboard" className="text-sm text-slate-700 underline">
          Back to dashboard
        </Link>
      </div>

      {detail.questions.length === 0 ? (
        <article className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Question 1</h2>
          <p className="text-sm text-slate-600">Prompt unavailable.</p>
          <div className="grid gap-4 border-t border-slate-200 pt-3 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Mentee Answer</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{detail.submission.answer || "-"}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">Mentor Feedback</p>
              {!detail.feedback ? (
                <p className="text-sm text-slate-600">No feedback yet for this submission.</p>
              ) : (
                <>
                  <p className="text-sm text-slate-800">
                    Reviewed by {detail.mentor?.name ?? "Mentor"} ({detail.feedback.score}/5)
                  </p>
                  <p className="text-sm text-slate-800">
                    Rubric: Correct Response {rubric?.correctResponse ?? 0}, Law {rubric?.law ?? 0},
                    Reasoning {rubric?.reasoning ?? 0}, Logic {rubric?.logic ?? 0}, Grammar {rubric?.grammar ?? 0}
                  </p>
                  <div
                    className="prose prose-sm max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: sanitizeFeedbackHtml(detail.feedback.comments) }}
                  />
                </>
              )}
            </div>
          </div>
        </article>
      ) : (
        <div className="space-y-4">
          {detail.questions.map((question, index) => {
            const questionId = question._id.toString();
            const answer = answerMap.get(questionId) ?? "";
            const questionComment = commentsByQuestion[index] ?? "";
            const renderedComment =
              detail.questions.length === 1
                ? questionComment || detail.feedback?.comments || ""
                : questionComment;

            return (
              <article key={questionId} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Question {index + 1}</h2>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{question.prompt}</p>
                </div>

                <div className="grid gap-4 border-t border-slate-200 pt-3 md:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                    <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Mentee Answer</p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{answer || "-"}</p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                    <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">Mentor Feedback</p>
                    {!detail.feedback ? (
                      <p className="text-sm text-slate-600">No feedback yet for this submission.</p>
                    ) : (
                      <>
                        <p className="text-sm text-slate-800">
                          Reviewed by {detail.mentor?.name ?? "Mentor"} ({detail.feedback.score}/5)
                        </p>
                        <p className="text-sm text-slate-800">
                          Rubric: Correct Response {rubric?.correctResponse ?? 0}, Law {rubric?.law ?? 0},
                          Reasoning {rubric?.reasoning ?? 0}, Logic {rubric?.logic ?? 0}, Grammar {rubric?.grammar ?? 0}
                        </p>
                        <div
                          className="prose prose-sm max-w-none text-slate-800"
                          dangerouslySetInnerHTML={{ __html: sanitizeFeedbackHtml(renderedComment) }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Exam Context</h2>
        <p className="text-sm text-slate-600">{detail.exam?.title ?? "Unknown exam"}</p>
        <p className="text-sm text-slate-600">
          {detail.exam?.subject ?? "Unknown subject"} - {detail.exam?.topic ?? "Unknown topic"}
        </p>
      </article>
    </section>
  );
}
