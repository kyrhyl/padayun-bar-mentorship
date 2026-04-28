"use client";

import { useMemo, useState } from "react";

interface QuestionPreviewItem {
  id: string;
  label: string;
  prompt: string;
}

interface ExamQuestionPreviewProps {
  questions: QuestionPreviewItem[];
  defaultQuestionId?: string;
}

export function ExamQuestionPreview({ questions, defaultQuestionId }: ExamQuestionPreviewProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState(defaultQuestionId ?? "");

  const selectedQuestion = useMemo(() => {
    return questions.find((question) => question.id === selectedQuestionId) ?? null;
  }, [questions, selectedQuestionId]);

  return (
    <div className="space-y-3">
      <label className="block text-sm text-slate-700">
        Question
        <select
          name="questionId"
          required
          value={selectedQuestionId}
          onChange={(event) => setSelectedQuestionId(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Select question</option>
          {questions.map((question) => (
            <option key={question.id} value={question.id}>
              {question.label}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        {selectedQuestion ? (
          <p className="whitespace-pre-wrap leading-6">{selectedQuestion.prompt}</p>
        ) : (
          <p className="text-slate-500">Select a question to preview its prompt.</p>
        )}
      </div>
    </div>
  );
}
