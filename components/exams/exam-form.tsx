"use client";

import { useMemo, useState } from "react";
import { BAR_SUBJECT_OPTIONS } from "@/lib/constants/bar-subjects";

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
  defaults?: {
    title: string;
    subject: string;
    topic: string;
    durationMinutes: number;
    instructions: string;
    isPublished: boolean;
    questionMode?: "manual" | "random_pool";
    questionIds?: string[];
    poolConfig?: {
      subject?: string;
      topic?: string;
      difficulties?: Array<"easy" | "medium" | "hard">;
      tags?: string[];
      questionCount: number;
    } | null;
  };
}

export function ExamForm({ mode, action, questions, defaults }: ExamFormProps) {
  const [questionMode, setQuestionMode] = useState<"manual" | "random_pool">(
    defaults?.questionMode ?? "manual",
  );
  const defaultQuestionIdSet = useMemo(
    () => new Set(defaults?.questionIds ?? []),
    [defaults?.questionIds],
  );
  const subjectOptions = defaults?.subject
    ? Array.from(new Set([...BAR_SUBJECT_OPTIONS, defaults.subject]))
    : BAR_SUBJECT_OPTIONS;

  return (
    <form action={action} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Question Mode
          <select
            name="questionMode"
            value={questionMode}
            onChange={(event) => setQuestionMode(event.target.value as "manual" | "random_pool")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="manual">Manual selection</option>
            <option value="random_pool">Random from question pool</option>
          </select>
        </label>
      </div>

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
          <select
            name="subject"
            required
            defaultValue={defaults?.subject ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
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
            required
            defaultValue={defaults?.topic ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      {questionMode === "manual" ? (
        <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-900">Select Questions</p>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {questions.map((question) => (
              <label key={question.id} className="block rounded-md border border-slate-200 bg-white p-2 text-sm">
                <input
                  type="checkbox"
                  name="questionIds"
                  value={question.id}
                  defaultChecked={defaultQuestionIdSet.has(question.id)}
                  className="mr-2"
                />
                <span className="font-medium text-slate-900">{question.subject} - {question.topic}</span>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">{question.prompt}</p>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-900">Random Pool Configuration</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-700">
              Pool Subject (optional)
              <input
                name="poolSubject"
                defaultValue={defaults?.poolConfig?.subject ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Pool Topic (optional)
              <input
                name="poolTopic"
                defaultValue={defaults?.poolConfig?.topic ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-700">
              Difficulties (comma-separated)
              <input
                name="poolDifficulties"
                defaultValue={defaults?.poolConfig?.difficulties?.join(",") ?? ""}
                placeholder="easy,medium"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Tags (comma-separated)
              <input
                name="poolTags"
                defaultValue={defaults?.poolConfig?.tags?.join(",") ?? ""}
                placeholder="evidence,ethics"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-sm text-slate-700">
            Number of Questions
            <input
              name="poolQuestionCount"
              type="number"
              min={1}
              max={100}
              defaultValue={defaults?.poolConfig?.questionCount ?? 3}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
      )}

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
