import { QUESTION_DIFFICULTIES, type QuestionDifficulty } from "@/models/Question";

interface QuestionFormProps {
  mode: "create" | "edit";
  action: (formData: FormData) => void;
  defaults?: {
    subject: string;
    topic: string;
    difficulty: QuestionDifficulty;
    tags: string[];
    prompt: string;
  };
}

export function QuestionForm({ mode, action, defaults }: QuestionFormProps) {
  return (
    <form action={action} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Subject
          <input
            name="subject"
            defaultValue={defaults?.subject ?? ""}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          Topic
          <input
            name="topic"
            defaultValue={defaults?.topic ?? ""}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Difficulty
          <select
            name="difficulty"
            defaultValue={defaults?.difficulty ?? "medium"}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {QUESTION_DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          Tags (comma-separated)
          <input
            name="tags"
            defaultValue={defaults?.tags?.join(", ") ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="evidence, remedial law"
          />
        </label>
      </div>

      <label className="block text-sm text-slate-700">
        Question Prompt
        <textarea
          name="prompt"
          defaultValue={defaults?.prompt ?? ""}
          required
          minLength={20}
          rows={8}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {mode === "create" ? "Create Question" : "Update Question"}
      </button>
    </form>
  );
}
