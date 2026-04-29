"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";

interface ExamAttemptClientProps {
  submissionId: string;
  examId: string;
  questions: Array<{ id: string; subject: string; topic: string; prompt: string }>;
  initialAnswers: Array<{ questionId: string; answer: string; lastSavedAt?: Date | null }>;
  initialLastSavedAt: string | null;
  initialIsSubmitted: boolean;
  startedAtIso: string;
  durationMinutes: number;
}

interface ExamStatusBarProps {
  deadlineMs: number;
  isSubmitted: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  onTimeUp: () => void;
}

function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function ExamAttemptClient({
  submissionId,
  examId,
  questions,
  initialAnswers,
  initialLastSavedAt,
  initialIsSubmitted,
  startedAtIso,
  durationMinutes,
}: ExamAttemptClientProps) {
  const router = useRouter();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const base = Object.fromEntries(questions.map((question) => [question.id, ""]));
    initialAnswers.forEach((item) => {
      if (item.questionId in base) {
        base[item.questionId] = item.answer.trim().length ? item.answer : "";
      }
    });
    return base;
  });
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialLastSavedAt);
  const [isSubmitted, setIsSubmitted] = useState(initialIsSubmitted);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startedAt = useMemo(() => new Date(startedAtIso).getTime(), [startedAtIso]);
  const deadlineMs = useMemo(
    () => startedAt + durationMinutes * 60 * 1000,
    [durationMinutes, startedAt],
  );

  const activeQuestion = questions[activeQuestionIndex] ?? null;

  const saveAnswer = useCallback(
    async (payload: { questionId: string; answer: string }) => {
      if (isSubmitted || !payload.questionId) {
        return;
      }

      setIsSaving(true);
      setError(null);

      const response = await fetch("/api/submissions/autosave", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          questionId: payload.questionId,
          answer: payload.answer,
          clientSavedAt: new Date().toISOString(),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        submission?: { isSubmitted: boolean; lastSavedAt: string | null };
      };

      if (!response.ok) {
        setError(data.error ?? "Failed to autosave answer.");
        setIsSaving(false);
        return;
      }

      setIsSubmitted(Boolean(data.submission?.isSubmitted));
      setLastSavedAt(data.submission?.lastSavedAt ?? new Date().toISOString());
      setIsSaving(false);
    },
    [isSubmitted, submissionId],
  );

  const { schedule, flush } = useDebouncedAutosave<{ questionId: string; answer: string }>({
    delayMs: 12000,
    onSave: saveAnswer,
  });

  const submitNow = useCallback(async () => {
    if (isSubmitted) {
      return;
    }

    setError(null);
    setSuccess(null);

    await flush();

    const response = await fetch("/api/submissions/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submissionId }),
    });

    const data = (await response.json()) as { error?: string; submission?: { isSubmitted: boolean } };

    if (!response.ok) {
      setError(data.error ?? "Failed to submit answer.");
      return;
    }

    setIsSubmitted(Boolean(data.submission?.isSubmitted));
    setSuccess("Exam submitted successfully. Redirecting to dashboard...");
    setTimeout(() => {
      router.push("/mentee/dashboard");
    }, 1400);
  }, [flush, isSubmitted, router, submissionId]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "hidden" || isSubmitted) {
        return;
      }

      const payload = JSON.stringify({
        submissionId,
        type: "tab_switch",
        at: new Date().toISOString(),
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/security-events", blob);
      } else {
        void fetch("/api/security-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isSubmitted, submissionId]);

  return (
    <div className="space-y-4">
      <ExamStatusBar
        deadlineMs={deadlineMs}
        isSubmitted={isSubmitted}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onTimeUp={() => {
          void submitNow();
        }}
      />

      <div className="rounded-md border border-slate-200 bg-white p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {questions.map((question, index) => (
            <button
              key={question.id}
              type="button"
              onClick={() => setActiveQuestionIndex(index)}
              className={`rounded border px-2 py-1 text-xs ${
                index === activeQuestionIndex ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
              }`}
            >
              Q{index + 1}
            </button>
          ))}
        </div>
        {activeQuestion ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-slate-900">
              Question {activeQuestionIndex + 1}: {activeQuestion.subject} - {activeQuestion.topic}
            </p>
            <p className="whitespace-pre-wrap leading-6 text-slate-700">{activeQuestion.prompt}</p>
          </div>
        ) : null}
      </div>

      <textarea
        value={activeQuestion ? answers[activeQuestion.id] ?? "" : ""}
        disabled={isSubmitted}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        onChange={(event) => {
          if (!activeQuestion) {
            return;
          }
          const next = event.target.value;
          setAnswers((current) => ({
            ...current,
            [activeQuestion.id]: next,
          }));
          schedule({ questionId: activeQuestion.id, answer: next });
        }}
        onCopy={(event) => event.preventDefault()}
        onPaste={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        rows={18}
        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 disabled:bg-slate-100"
        placeholder="Write your answer here."
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void flush()}
          disabled={isSubmitted || isSaving}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-60"
        >
          Save now
        </button>
        <button
          type="button"
          onClick={() => void submitNow()}
          disabled={isSubmitted}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Submit Answer
        </button>
      </div>

      <p className="text-xs text-slate-500">Exam ID: {examId}</p>
    </div>
  );
}

function ExamStatusBar({ deadlineMs, isSubmitted, isSaving, lastSavedAt, onTimeUp }: ExamStatusBarProps) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadlineMs - Date.now()));

  useEffect(() => {
    let hasSubmittedOnTimeout = false;

    const tick = () => {
      const timeLeft = Math.max(0, deadlineMs - Date.now());
      setRemainingMs(timeLeft);

      if (timeLeft <= 0 && !isSubmitted && !hasSubmittedOnTimeout) {
        hasSubmittedOnTimeout = true;
        onTimeUp();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [deadlineMs, isSubmitted, onTimeUp]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
      <p>
        Time Remaining: <span className="font-semibold">{formatRemainingTime(remainingMs)}</span>
      </p>
      <p>
        {isSubmitted
          ? "Submitted"
          : isSaving
            ? "Autosaving..."
            : lastSavedAt
              ? `Last saved: ${new Date(lastSavedAt).toLocaleTimeString()}`
              : "Not saved yet"}
      </p>
    </div>
  );
}
