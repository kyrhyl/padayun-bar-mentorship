import { QUESTION_DIFFICULTIES, type QuestionDifficulty } from "@/models/Question";
import { BAR_SUBJECT_OPTIONS } from "@/lib/constants/bar-subjects";

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
  const subjectOptions = defaults?.subject
    ? Array.from(new Set([...BAR_SUBJECT_OPTIONS, defaults.subject]))
    : BAR_SUBJECT_OPTIONS;

  return (
    <form action={action} className="ui-card space-y-4 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Subject
          <select
            name="subject"
            defaultValue={defaults?.subject ?? ""}
            required
            className="ui-input mt-1 w-full"
          >
            <option value="" disabled>
              Select a subject
            </option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          Topic
          <input
            name="topic"
            defaultValue={defaults?.topic ?? ""}
            required
            className="ui-input mt-1 w-full"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Difficulty
          <select
            name="difficulty"
            defaultValue={defaults?.difficulty ?? "medium"}
            className="ui-input mt-1 w-full"
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
            className="ui-input mt-1 w-full"
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
            className="ui-input mt-1 w-full"
        />
      </label>

      <button
        type="submit"
        className="ui-btn-primary text-sm font-medium"
      >
        {mode === "create" ? "Create Question" : "Update Question"}
      </button>
    </form>
  );
}
