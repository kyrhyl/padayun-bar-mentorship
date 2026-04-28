import Link from "next/link";

import { createQuestionAction } from "@/app/(dashboard)/admin/questions/actions";
import { QuestionForm } from "@/components/questions/question-form";
import { requireRole } from "@/lib/auth/authorization";

export default async function NewQuestionPage() {
  await requireRole(["admin"]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Create Question</h1>
        <Link href="/admin/questions" className="text-sm text-slate-700 underline">
          Back to Question Bank
        </Link>
      </div>

      <QuestionForm mode="create" action={createQuestionAction} />
    </section>
  );
}
