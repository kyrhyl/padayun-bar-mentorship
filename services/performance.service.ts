import { buildPaginationMeta } from "@/lib/utils/pagination";
import { performanceFilterSchema } from "@/lib/validators/performance";
import { isMentorAssignedToMentee, listAssignedMenteeIds } from "@/repositories/mentor-assignment.repository";
import { listFeedbackBySubmissionIds } from "@/repositories/feedback.repository";
import {
  aggregateSubmissionPerformanceByUserIds,
  aggregateMenteePerformanceDetail,
  listSubmittedSubmissionsByUserIdsAll,
} from "@/repositories/submission.repository";
import { listUsersByIds, listUsersByRole } from "@/repositories/user.repository";
import { listExamsByIds } from "@/repositories/exam.repository";

interface MenteePerformanceListItem {
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  totalSubmissions: number;
  reviewedSubmissions: number;
  pendingReviews: number;
  averageScore: number | null;
  lastSubmittedAt: Date | null;
}

interface MenteePerformanceDetail {
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  totalSubmissions: number;
  reviewedSubmissions: number;
  pendingReviews: number;
  averageScore: number | null;
  weakSubjects: Array<{ subject: string; averageScore: number }>;
  recentScores: Array<{ submissionId: string; score: number; updatedAt: Date }>;
}

const PERF_LOG_ENABLED = process.env.PERF_LOGS === "1";

function logPerf(label: string, startedAt: number, meta?: Record<string, unknown>) {
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

function getRangeStart(range: "7d" | "30d" | "90d" | "all"): Date | null {
  if (range === "all") {
    return null;
  }

  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function toMenteeMap(users: Awaited<ReturnType<typeof listUsersByIds>>) {
  return new Map(users.map((user) => [user._id.toString(), user]));
}

export async function getMentorPerformanceListService(
  mentorId: string,
  input: Record<string, unknown>,
): Promise<{
  items: MenteePerformanceListItem[];
  meta: ReturnType<typeof buildPaginationMeta>;
  filters: { range: "7d" | "30d" | "90d" | "all"; subject?: string; page: number; limit: number };
}> {
  const startedAt = Date.now();
  const parsed = performanceFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid performance filters.");
  }

  const menteeIds = await listAssignedMenteeIds(mentorId);
  const result = await getPerformanceListByMenteeIds(menteeIds, parsed.data);
  logPerf("mentor-performance-list", startedAt, {
    menteeCount: menteeIds.length,
    items: result.items.length,
    totalItems: result.meta.totalItems,
    range: parsed.data.range,
  });
  return result;
}

export async function getAdminPerformanceListService(input: Record<string, unknown>): Promise<{
  items: MenteePerformanceListItem[];
  meta: ReturnType<typeof buildPaginationMeta>;
  filters: { range: "7d" | "30d" | "90d" | "all"; subject?: string; page: number; limit: number };
}> {
  const parsed = performanceFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid performance filters.");
  }

  const mentees = await listUsersByRole("mentee");
  return getPerformanceListByMenteeIds(
    mentees.map((mentee) => mentee._id.toString()),
    parsed.data,
  );
}

async function getPerformanceListByMenteeIds(
  menteeIds: string[],
  filters: { range: "7d" | "30d" | "90d" | "all"; subject?: string; page: number; limit: number },
) {
  const rangeStart = getRangeStart(filters.range);
  const [mentees, aggregates] = await Promise.all([
    listUsersByIds(menteeIds),
    aggregateSubmissionPerformanceByUserIds({
      userIds: menteeIds,
      rangeStart,
      subject: filters.subject,
    }),
  ]);

  const byMentee = new Map<string, MenteePerformanceListItem>();
  const menteeMap = toMenteeMap(mentees);

  menteeIds.forEach((menteeId) => {
    const mentee = menteeMap.get(menteeId);
    byMentee.set(menteeId, {
      menteeId,
      menteeName: mentee?.name ?? "Unknown Mentee",
      menteeEmail: mentee?.email ?? "Unknown Email",
      totalSubmissions: 0,
      reviewedSubmissions: 0,
      pendingReviews: 0,
      averageScore: null,
      lastSubmittedAt: null,
    });
  });

  aggregates.forEach((aggregate) => {
    const row = byMentee.get(aggregate.userId);
    if (!row) {
      return;
    }

    row.totalSubmissions = aggregate.totalSubmissions;
    row.reviewedSubmissions = aggregate.reviewedSubmissions;
    row.pendingReviews = aggregate.pendingReviews;
    row.averageScore = aggregate.averageScore;
    row.lastSubmittedAt = aggregate.lastSubmittedAt;
  });

  const allItems = [...byMentee.values()].sort((a, b) => {
    const aTime = a.lastSubmittedAt ? a.lastSubmittedAt.getTime() : 0;
    const bTime = b.lastSubmittedAt ? b.lastSubmittedAt.getTime() : 0;
    return bTime - aTime;
  });

  const start = (filters.page - 1) * filters.limit;
  const items = allItems.slice(start, start + filters.limit);

  return {
    items,
    meta: buildPaginationMeta({
      page: filters.page,
      limit: filters.limit,
      totalItems: allItems.length,
    }),
    filters,
  };
}

export async function getMentorMenteePerformanceDetailService(
  mentorId: string,
  menteeId: string,
  input: Record<string, unknown>,
): Promise<MenteePerformanceDetail> {
  const isAssigned = await isMentorAssignedToMentee({ mentorId, menteeId });
  if (!isAssigned) {
    throw new Error("Mentor is not assigned to this mentee.");
  }

  return getMenteePerformanceDetail(menteeId, input);
}

export async function getAdminMenteePerformanceDetailService(
  menteeId: string,
  input: Record<string, unknown>,
): Promise<MenteePerformanceDetail> {
  return getMenteePerformanceDetail(menteeId, input);
}

async function getMenteePerformanceDetail(
  menteeId: string,
  input: Record<string, unknown>,
): Promise<MenteePerformanceDetail> {
  const startedAt = Date.now();
  const parsed = performanceFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid performance filters.");
  }

  const rangeStart = getRangeStart(parsed.data.range);
  const [mentee] = await listUsersByIds([menteeId]);
  const aggregate = await aggregateMenteePerformanceDetail({
    userId: menteeId,
    rangeStart,
    subject: parsed.data.subject,
    weakLimit: 5,
    recentLimit: 10,
  });

  const result = {
    menteeId,
    menteeName: mentee?.name ?? "Unknown Mentee",
    menteeEmail: mentee?.email ?? "Unknown Email",
    totalSubmissions: aggregate.totalSubmissions,
    reviewedSubmissions: aggregate.reviewedSubmissions,
    pendingReviews: aggregate.pendingReviews,
    averageScore: aggregate.averageScore,
    weakSubjects: aggregate.weakSubjects,
    recentScores: aggregate.recentScores,
  };

  logPerf("mentee-performance-detail", startedAt, {
    menteeId,
    submissions: aggregate.totalSubmissions,
    reviewedSubmissions: aggregate.reviewedSubmissions,
    pendingReviews: aggregate.pendingReviews,
    range: parsed.data.range,
  });

  return result;
}
