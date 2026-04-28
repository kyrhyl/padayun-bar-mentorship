"use client";

import { useState } from "react";

interface RubricStepperProps {
  name: string;
  label: string;
  min: number;
  max: number;
  defaultValue: number;
}

function clampQuarter(value: number, min: number, max: number) {
  const rounded = Math.round(value * 4) / 4;
  return Math.min(max, Math.max(min, rounded));
}

export function RubricStepper({ name, label, min, max, defaultValue }: RubricStepperProps) {
  const [value, setValue] = useState(clampQuarter(defaultValue, min, max));
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <label className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-700">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate">{label}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800">{value.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setValue((current) => clampQuarter(current - 0.25, min, max))}
          disabled={!canDecrease}
          className="h-7 w-7 rounded border border-slate-300 bg-white text-sm font-semibold text-slate-700 disabled:opacity-40"
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <input
          name={name}
          type="number"
          min={min}
          max={max}
          step={0.25}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            setValue(Number.isFinite(next) ? clampQuarter(next, min, max) : min);
          }}
          className="h-7 w-14 rounded-md border border-slate-300 px-1 text-center text-xs"
        />
        <button
          type="button"
          onClick={() => setValue((current) => clampQuarter(current + 0.25, min, max))}
          disabled={!canIncrease}
          className="h-7 w-7 rounded border border-slate-300 bg-white text-sm font-semibold text-slate-700 disabled:opacity-40"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </label>
  );
}
