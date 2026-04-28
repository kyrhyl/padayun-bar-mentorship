import Link from "next/link";

import { createExamAction } from "@/app/(dashboard)/admin/exams/actions";
import { ExamForm } from "@/components/exams/exam-form";
import { requireRole } from "@/lib/auth/authorization";
import { listQuestionsService } from "@/services/question.service";

interface NewExamPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewExamPage({ searchParams }: NewExamPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const questions = await listQuestionsService({ page: 1, limit: 20 });
  const questionOptions = questions.items.map((question) => ({
    id: question._id.toString(),
    subject: question.subject,
    topic: question.topic,
    prompt: question.prompt,
  }));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Create Exam</h1>
        <Link href="/admin/exams" className="text-sm underline text-slate-700">
          Back to exams
        </Link>
      </div>

      {params.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error === "invalid_form"
            ? "Please complete all required exam fields correctly."
            : "Failed to create exam. Please try again."}
        </div>
      ) : null}

      <ExamForm mode="create" action={createExamAction} questions={questionOptions} />

    </section>
  );
}
