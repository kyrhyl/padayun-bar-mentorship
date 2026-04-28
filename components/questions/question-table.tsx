import Link from "next/link";

import type { QuestionDocument } from "@/models/Question";

interface QuestionTableProps {
  items: QuestionDocument[];
  onDelete: (questionId: string) => Promise<void>;
}

export function QuestionTable({ items, onDelete }: QuestionTableProps) {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No questions found for the current filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Topic</th>
            <th className="px-4 py-3">Difficulty</th>
            <th className="px-4 py-3">Tags</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((question) => (
            <tr key={question._id.toString()}>
              <td className="px-4 py-3 font-medium text-slate-900">{question.subject}</td>
              <td className="px-4 py-3 text-slate-700">{question.topic}</td>
              <td className="px-4 py-3 capitalize text-slate-700">{question.difficulty}</td>
              <td className="px-4 py-3 text-slate-600">{question.tags.join(", ") || "-"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/questions/${question._id.toString()}/edit`}
                    className="text-slate-800 underline"
                  >
                    Edit
                  </Link>
                  <form action={onDelete.bind(null, question._id.toString())}>
                    <button type="submit" className="text-red-700 underline">
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
