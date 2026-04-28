"use client";

import { useEffect, useState } from "react";

const quotes = [
  {
    text: "The bar is not won in one night, but in every disciplined day you show up.",
    by: "Padayun Principle",
  },
  {
    text: "Progress in bar review is quiet: one case digested, one answer improved, one fear reduced.",
    by: "Daily Study Reminder",
  },
  {
    text: "Write with clarity, argue with courage, and trust the work you have repeated.",
    by: "Mentor's Note",
  },
  {
    text: "You do not need perfect days; you need consistent ones.",
    by: "Bar Journey Quote",
  },
] as const;

const storageKey = "padayun-hero-quote-index";

function getNextQuoteIndex(previousIndex: number | null) {
  if (quotes.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * quotes.length);
  while (previousIndex !== null && nextIndex === previousIndex) {
    nextIndex = Math.floor(Math.random() * quotes.length);
  }

  return nextIndex;
}

export function HeroQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const previousRaw = window.sessionStorage.getItem(storageKey);
    const previousIndex = previousRaw === null ? null : Number(previousRaw);
    const nextIndex = getNextQuoteIndex(Number.isNaN(previousIndex) ? null : previousIndex);

    const timer = window.setTimeout(() => {
      setQuoteIndex(nextIndex);
      window.sessionStorage.setItem(storageKey, String(nextIndex));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-2xl text-white">
      <p className="text-sm font-medium italic leading-relaxed md:text-base">&quot;{quotes[quoteIndex].text}&quot;</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
        {quotes[quoteIndex].by}
      </p>
    </div>
  );
}
