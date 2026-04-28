import { notFound } from "next/navigation";

import { ExamAttemptClient } from "@/components/exams/exam-attempt-client";
import { requireRole } from "@/lib/auth/authorization";
import { getExamWithQuestionService } from "@/services/exam.service";
import { getOrCreateSubmissionService } from "@/services/submission.service";

interface ExamAttemptPageProps {
  params: Promise<{ examId: string }>;
}

export default async function ExamAttemptPage({ params }: ExamAttemptPageProps) {
  const session = await requireRole(["mentee", "admin"]);
  const { examId } = await params;

  const payload = await getExamWithQuestionService(examId);
  if (!payload) {
    notFound();
  }

  const submission = await getOrCreateSubmissionService({
    userId: session.user.id,
    examId,
  });

  return (
    <section className="space-y-5">
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-semibold text-slate-900">{payload.exam.title}</h1>
        <p className="text-sm text-slate-600">
          {payload.exam.subject} - {payload.exam.topic} - {payload.exam.durationMinutes} minutes
        </p>
        <p className="text-sm text-slate-700">{payload.exam.instructions}</p>
      </div>

      <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Essay Prompt</h2>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{payload.question.prompt}</p>
      </article>

      <ExamAttemptClient
        examId={examId}
        submissionId={submission._id.toString()}
        initialAnswer={submission.answer}
        initialLastSavedAt={submission.lastSavedAt ? submission.lastSavedAt.toISOString() : null}
        initialIsSubmitted={submission.isSubmitted}
        startedAtIso={submission.startedAt.toISOString()}
        durationMinutes={payload.exam.durationMinutes}
      />
    </section>
  );
}
