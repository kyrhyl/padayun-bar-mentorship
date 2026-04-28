"use client";

import { useMemo, useState } from "react";

interface Criterion {
  key: "correctResponse" | "law" | "reasoning" | "logic" | "grammar";
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  step?: number;
}

interface RubricScoreColumnProps {
  criteria: Criterion[];
}

function clampToStep(value: number, min: number, max: number, step: number) {
  const rounded = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, rounded));
}

export function RubricScoreColumn({ criteria }: RubricScoreColumnProps) {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      criteria.map((item) => [item.key, clampToStep(item.defaultValue, item.min, item.max, item.step ?? 0.25)]),
    ),
  );

  const total = useMemo(
    () => Object.values(scores).reduce((sum, value) => sum + value, 0),
    [scores],
  );

  return (
    <div className="space-y-1.5">
      {criteria.map((item) => {
        const value = scores[item.key] ?? item.min;
        const step = item.step ?? 0.25;

        return (
          <label key={item.key} className="block rounded-md border border-neutral-300 bg-gradient-to-b from-white to-neutral-50 px-2 py-1.5 text-[11px] text-neutral-700">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <span className="min-w-0 pr-1 font-semibold tracking-wide text-neutral-950">{item.label}</span>
              <div className="shrink-0 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setScores((current) => ({
                    ...current,
                    [item.key]: clampToStep(value - step, item.min, item.max, step),
                  }))
                }
                disabled={value <= item.min}
                className="h-6 w-6 rounded-md border border-neutral-400 bg-white text-xs font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
              >
                -
              </button>

              <input
                name={item.key}
                type="number"
                min={item.min}
                max={item.max}
                step={step}
                value={value}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setScores((current) => ({
                    ...current,
                    [item.key]: Number.isFinite(next)
                      ? clampToStep(next, item.min, item.max, step)
                      : item.min,
                  }));
                }}
                className="h-6 w-12 rounded-md border border-neutral-400 bg-white px-1 text-center text-[11px] font-semibold text-neutral-900 focus:border-black focus:outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setScores((current) => ({
                    ...current,
                    [item.key]: clampToStep(value + step, item.min, item.max, step),
                  }))
                }
                disabled={value >= item.max}
                className="h-6 w-6 rounded-md border border-neutral-400 bg-white text-xs font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
              >
                +
              </button>
              </div>
            </div>
          </label>
        );
      })}

      <div className="ml-auto w-fit rounded-md border border-black bg-black px-2 py-1.5 text-[11px] text-right">
        <p className="font-semibold tracking-wide text-white/85">Total</p>
        <p className="text-xs font-semibold text-white">{total.toFixed(2)} / 5.00</p>
      </div>
    </div>
  );
}
