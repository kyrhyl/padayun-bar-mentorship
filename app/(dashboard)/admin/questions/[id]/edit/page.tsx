import Link from "next/link";
import { notFound } from "next/navigation";

import { updateQuestionAction } from "@/app/(dashboard)/admin/questions/actions";
import { QuestionForm } from "@/components/questions/question-form";
import { requireRole } from "@/lib/auth/authorization";
import { findQuestionByIdService } from "@/services/question.service";

interface EditQuestionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  await requireRole(["admin"]);

  const { id } = await params;
  const question = await findQuestionByIdService(id);

  if (!question) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Question</h1>
        <Link href="/admin/questions" className="text-sm text-slate-700 underline">
          Back to Question Bank
        </Link>
      </div>

      <QuestionForm
        mode="edit"
        action={updateQuestionAction.bind(null, id)}
        defaults={{
          subject: question.subject,
          topic: question.topic,
          difficulty: question.difficulty,
          tags: question.tags,
          prompt: question.prompt,
        }}
      />
    </section>
  );
}
