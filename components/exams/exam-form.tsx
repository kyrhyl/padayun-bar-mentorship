"use client";

import type { ExamDocument } from "@/models/Exam";
import { ExamQuestionPreview } from "@/components/exams/exam-question-preview";

interface ExamQuestionOption {
  id: string;
  subject: string;
  topic: string;
  prompt: string;
}

interface ExamFormProps {
  mode: "create" | "edit";
  action: (formData: FormData) => void;
  questions: ExamQuestionOption[];
  defaults?: Pick<
    ExamDocument,
    "title" | "subject" | "topic" | "questionId" | "durationMinutes" | "instructions" | "isPublished"
  >;
}

export function ExamForm({ mode, action, questions, defaults }: ExamFormProps) {
  return (
    <form action={action} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Title
          <input
            name="title"
            required
            defaultValue={defaults?.title ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Duration (minutes)
          <input
            name="durationMinutes"
            type="number"
            min={10}
            max={240}
            required
            defaultValue={defaults?.durationMinutes ?? 45}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Subject
          <input
            name="subject"
            required
            defaultValue={defaults?.subject ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Topic
          <input
            name="topic"
            required
            defaultValue={defaults?.topic ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <ExamQuestionPreview
        defaultQuestionId={defaults?.questionId}
        questions={questions.map((question) => ({
          id: question.id,
          label: `${question.subject} - ${question.topic}`,
          prompt: question.prompt,
        }))}
      />

      <label className="block text-sm text-slate-700">
        Instructions
        <textarea
          name="instructions"
          required
          minLength={10}
          rows={5}
          defaultValue={defaults?.instructions ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input name="isPublished" type="checkbox" defaultChecked={defaults?.isPublished ?? false} />
        Publish exam
      </label>

      <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
        {mode === "create" ? "Create Exam" : "Update Exam"}
      </button>
    </form>
  );
}
