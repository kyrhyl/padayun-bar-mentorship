import Link from "next/link";

import { QuestionFilters } from "@/components/questions/question-filters";
import { QuestionPagination } from "@/components/questions/question-pagination";
import { QuestionTable } from "@/components/questions/question-table";
import { requireRole } from "@/lib/auth/authorization";
import { deleteQuestionAction } from "@/app/(dashboard)/admin/questions/actions";
import { listQuestionsService } from "@/services/question.service";

interface QuestionsPageProps {
  searchParams: Promise<{
    subject?: string;
    topic?: string;
    difficulty?: "easy" | "medium" | "hard";
    page?: string;
    limit?: string;
  }>;
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  await requireRole(["admin"]);

  const params = await searchParams;

  const response = await listQuestionsService({
    subject: params.subject,
    topic: params.topic,
    difficulty: params.difficulty,
    page: params.page,
    limit: params.limit,
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Question Bank</h1>
        <Link
          href="/admin/questions/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          New Question
        </Link>
      </div>

      <QuestionFilters
        defaults={{
          subject: response.filters.subject,
          topic: response.filters.topic,
          difficulty: response.filters.difficulty,
          limit: response.filters.limit,
        }}
      />

      <QuestionTable items={response.items} onDelete={deleteQuestionAction} />

      <QuestionPagination
        meta={response.meta}
        pathname="/admin/questions"
        query={{
          subject: response.filters.subject,
          topic: response.filters.topic,
          difficulty: response.filters.difficulty,
          limit: String(response.filters.limit),
        }}
      />
    </section>
  );
}
