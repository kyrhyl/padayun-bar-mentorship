import Link from "next/link";

import type { PaginationMeta } from "@/lib/utils/pagination";

interface QuestionPaginationProps {
  meta: PaginationMeta;
  pathname: string;
  query: Record<string, string | undefined>;
}

function buildPageUrl(
  pathname: string,
  query: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}

export function QuestionPagination({ meta, pathname, query }: QuestionPaginationProps) {
  const previousPage = Math.max(1, meta.page - 1);
  const nextPage = Math.min(meta.totalPages, meta.page + 1);

  return (
    <div className="flex items-center justify-between text-sm text-slate-700">
      <p>
        Page {meta.page} of {meta.totalPages} ({meta.totalItems} total)
      </p>

      <div className="flex gap-2">
        <Link
          href={buildPageUrl(pathname, query, previousPage)}
          className={`rounded border border-slate-300 px-3 py-1.5 ${
            meta.page === 1 ? "pointer-events-none opacity-50" : ""
          }`}
          aria-disabled={meta.page === 1}
        >
          Previous
        </Link>
        <Link
          href={buildPageUrl(pathname, query, nextPage)}
          className={`rounded border border-slate-300 px-3 py-1.5 ${
            meta.page === meta.totalPages ? "pointer-events-none opacity-50" : ""
          }`}
          aria-disabled={meta.page === meta.totalPages}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
