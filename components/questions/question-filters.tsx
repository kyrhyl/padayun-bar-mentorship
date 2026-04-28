import { QUESTION_DIFFICULTIES } from "@/models/Question";

interface QuestionFiltersProps {
  defaults: {
    subject?: string;
    topic?: string;
    difficulty?: string;
    limit: number;
  };
}

export function QuestionFilters({ defaults }: QuestionFiltersProps) {
  return (
    <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
      <input
        name="subject"
        defaultValue={defaults.subject ?? ""}
        placeholder="Filter by subject"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        name="topic"
        defaultValue={defaults.topic ?? ""}
        placeholder="Filter by topic"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <select
        name="difficulty"
        defaultValue={defaults.difficulty ?? ""}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">All difficulties</option>
        {QUESTION_DIFFICULTIES.map((difficulty) => (
          <option key={difficulty} value={difficulty}>
            {difficulty}
          </option>
        ))}
      </select>
      <select
        name="limit"
        defaultValue={String(defaults.limit)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="10">10 per page</option>
        <option value="20">20 per page</option>
      </select>
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
      >
        Apply Filters
      </button>
    </form>
  );
}
