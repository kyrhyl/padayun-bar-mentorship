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
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Topic</th>
            <th className="px-4 py-3">Difficulty</th>
            <th className="px-4 py-3">Tags</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((question) => (
            <tr key={question._id.toString()} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{question.subject}</td>
              <td className="px-4 py-3 text-slate-700">{question.topic}</td>
              <td className="px-4 py-3 capitalize text-slate-700">
                <span className="rounded bg-slate-100 px-2 py-1 text-xs">{question.difficulty}</span>
              </td>
              <td className="px-4 py-3 text-slate-600">{question.tags.join(", ") || "-"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-4 whitespace-nowrap">
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
    </div>
  );
}
