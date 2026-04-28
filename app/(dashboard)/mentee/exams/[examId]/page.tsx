import { notFound } from "next/navigation";

import { ExamAttemptClient } from "@/components/exams/exam-attempt-client";
import { requireRole } from "@/lib/auth/authorization";
import { getExamWithQuestionsService } from "@/services/exam.service";
import { getOrCreateSubmissionService } from "@/services/submission.service";

interface ExamAttemptPageProps {
  params: Promise<{ examId: string }>;
}

export default async function ExamAttemptPage({ params }: ExamAttemptPageProps) {
  const session = await requireRole(["mentee", "admin"]);
  const { examId } = await params;

  const payload = await getExamWithQuestionsService(examId);
  if (!payload) {
    notFound();
  }

  const submission = await getOrCreateSubmissionService({
    userId: session.user.id,
    examId,
  });

  return (
    <section className="space-y-5">
      <ExamAttemptClient
        examId={examId}
        submissionId={submission._id.toString()}
        questions={payload.questions.map((question) => ({
          id: question._id.toString(),
          subject: question.subject,
          topic: question.topic,
          prompt: question.prompt,
        }))}
        initialAnswers={submission.answers ?? []}
        initialLastSavedAt={submission.lastSavedAt ? submission.lastSavedAt.toISOString() : null}
        initialIsSubmitted={submission.isSubmitted}
        startedAtIso={submission.startedAt.toISOString()}
        durationMinutes={payload.exam.durationMinutes}
      />
    </section>
  );
}
