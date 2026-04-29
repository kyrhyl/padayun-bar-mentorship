const PERF_LOG_ENABLED = process.env.PERF_LOGS === "1";

export function perfNow() {
  return Date.now();
}

export function perfLog(label: string, startedAt: number, meta?: Record<string, unknown>) {
  if (!PERF_LOG_ENABLED) {
    return;
  }

  const durationMs = Date.now() - startedAt;
  if (meta) {
    console.info(`[perf] ${label}: ${durationMs}ms`, meta);
    return;
  }

  console.info(`[perf] ${label}: ${durationMs}ms`);
}
