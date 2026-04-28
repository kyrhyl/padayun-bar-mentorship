"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";

interface ExamAttemptClientProps {
  submissionId: string;
  examId: string;
  initialAnswer: string;
  initialLastSavedAt: string | null;
  initialIsSubmitted: boolean;
  startedAtIso: string;
  durationMinutes: number;
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
  initialAnswer,
  initialLastSavedAt,
  initialIsSubmitted,
  startedAtIso,
  durationMinutes,
}: ExamAttemptClientProps) {
  const router = useRouter();
  const [answer, setAnswer] = useState(initialAnswer);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialLastSavedAt);
  const [isSubmitted, setIsSubmitted] = useState(initialIsSubmitted);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startedAt = useMemo(() => new Date(startedAtIso).getTime(), [startedAtIso]);
  const deadlineMs = useMemo(
    () => startedAt + durationMinutes * 60 * 1000,
    [durationMinutes, startedAt],
  );
  const [remainingMs, setRemainingMs] = useState(durationMinutes * 60 * 1000);

  const saveAnswer = useCallback(
    async (nextAnswer: string) => {
      if (isSubmitted) {
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
          answer: nextAnswer,
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

  const { schedule, flush } = useDebouncedAutosave<string>({
    delayMs: 12000,
    onSave: saveAnswer,
  });

  const submitNow = useCallback(async () => {
    if (isSubmitted) {
      return;
    }

    setError(null);

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
    router.refresh();
  }, [flush, isSubmitted, router, submissionId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = Math.max(0, deadlineMs - Date.now());
      setRemainingMs(timeLeft);

      if (timeLeft <= 0 && !isSubmitted) {
        void submitNow();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [deadlineMs, isSubmitted, submitNow]);

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

      <textarea
        value={answer}
        disabled={isSubmitted}
        onChange={(event) => {
          const next = event.target.value;
          setAnswer(next);
          schedule(next);
        }}
        onCopy={(event) => event.preventDefault()}
        onPaste={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        rows={18}
        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 disabled:bg-slate-100"
        placeholder="Write your answer here."
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
