"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseDebouncedAutosaveOptions<T> {
  delayMs: number;
  onSave: (value: T) => Promise<void>;
}

export function useDebouncedAutosave<T>({
  delayMs,
  onSave,
}: UseDebouncedAutosaveOptions<T>) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValueRef = useRef<T | null>(null);

  const clearPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(async () => {
    clearPending();

    if (latestValueRef.current === null) {
      return;
    }

    const value = latestValueRef.current;
    latestValueRef.current = null;
    await onSave(value);
  }, [clearPending, onSave]);

  const schedule = useCallback(
    (value: T) => {
      latestValueRef.current = value;
      clearPending();

      timeoutRef.current = setTimeout(() => {
        void flush();
      }, delayMs);
    },
    [clearPending, delayMs, flush],
  );

  useEffect(() => {
    return () => {
      clearPending();
    };
  }, [clearPending]);

  return {
    schedule,
    flush,
  };
}
