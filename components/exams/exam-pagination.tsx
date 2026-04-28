import Link from "next/link";

import type { PaginationMeta } from "@/lib/utils/pagination";

interface ExamPaginationProps {
  meta: PaginationMeta;
  pathname: string;
  query: Record<string, string | undefined>;
  pageParam?: string;
}

function buildPageUrl(
  pathname: string,
  query: Record<string, string | undefined>,
  page: number,
  pageParam: string,
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set(pageParam, String(page));
  return `${pathname}?${params.toString()}`;
}

export function ExamPagination({
  meta,
  pathname,
  query,
  pageParam = "page",
}: ExamPaginationProps) {
  const previousPage = Math.max(1, meta.page - 1);
  const nextPage = Math.min(meta.totalPages, meta.page + 1);

  return (
    <div className="flex items-center justify-between text-sm text-slate-700">
      <p>
        Page {meta.page} of {meta.totalPages} ({meta.totalItems} total)
      </p>

      <div className="flex gap-2">
        <Link
          href={buildPageUrl(pathname, query, previousPage, pageParam)}
          className={`rounded border border-slate-300 px-3 py-1.5 ${
            meta.page === 1 ? "pointer-events-none opacity-50" : ""
          }`}
          aria-disabled={meta.page === 1}
        >
          Previous
        </Link>
        <Link
          href={buildPageUrl(pathname, query, nextPage, pageParam)}
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
