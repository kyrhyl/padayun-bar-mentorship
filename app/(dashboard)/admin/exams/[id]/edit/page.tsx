import Link from "next/link";
import { notFound } from "next/navigation";

import { updateExamAction } from "@/app/(dashboard)/admin/exams/actions";
import { ExamForm } from "@/components/exams/exam-form";
import { requireRole } from "@/lib/auth/authorization";
import { findExamById } from "@/repositories/exam.repository";
import { listQuestionsService } from "@/services/question.service";

interface EditExamPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditExamPage({ params, searchParams }: EditExamPageProps) {
  await requireRole(["admin"]);
  const { id } = await params;
  const query = await searchParams;

  const [exam, questions] = await Promise.all([findExamById(id), listQuestionsService({ page: 1, limit: 20 })]);
  const questionOptions = questions.items.map((question) => ({
    id: question._id.toString(),
    subject: question.subject,
    topic: question.topic,
    prompt: question.prompt,
  }));

  if (!exam) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Exam</h1>
        <Link href="/admin/exams" className="text-sm underline text-slate-700">
          Back to exams
        </Link>
      </div>

      {query.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.error === "invalid_form"
            ? "Please complete all required exam fields correctly."
            : "Failed to update exam. Please try again."}
        </div>
      ) : null}

      <ExamForm
        mode="edit"
        action={updateExamAction.bind(null, id)}
        questions={questionOptions}
        defaults={{
          title: exam.title,
          subject: exam.subject,
          topic: exam.topic,
          durationMinutes: exam.durationMinutes,
          instructions: exam.instructions,
          isPublished: exam.isPublished,
          questionMode: exam.questionMode ?? "manual",
          questionIds: exam.questionIds?.length
            ? exam.questionIds
            : exam.questionId
              ? [exam.questionId]
              : [],
          poolConfig: exam.poolConfig ?? null,
        }}
      />
    </section>
  );
}
