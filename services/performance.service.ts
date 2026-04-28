import { buildPaginationMeta } from "@/lib/utils/pagination";
import { performanceFilterSchema } from "@/lib/validators/performance";
import { isMentorAssignedToMentee, listAssignedMenteeIds } from "@/repositories/mentor-assignment.repository";
import { listFeedbackBySubmissionIds } from "@/repositories/feedback.repository";
import { listSubmittedSubmissionsByUserIdsAll } from "@/repositories/submission.repository";
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
  const parsed = performanceFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid performance filters.");
  }

  const menteeIds = await listAssignedMenteeIds(mentorId);
  return getPerformanceListByMenteeIds(menteeIds, parsed.data);
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
  const [mentees, submissions] = await Promise.all([
    listUsersByIds(menteeIds),
    listSubmittedSubmissionsByUserIdsAll(menteeIds),
  ]);

  const scopedSubmissions = submissions.filter((submission) => {
    if (!submission.submittedAt) {
      return false;
    }

    if (rangeStart && submission.submittedAt < rangeStart) {
      return false;
    }

    return true;
  });

  const [feedback, exams] = await Promise.all([
    listFeedbackBySubmissionIds(scopedSubmissions.map((submission) => submission._id.toString())),
    listExamsByIds(scopedSubmissions.map((submission) => submission.examId)),
  ]);

  const feedbackBySubmissionId = new Map(feedback.map((item) => [item.submissionId, item]));
  const examById = new Map(exams.map((exam) => [exam._id.toString(), exam]));

  const filteredSubmissions = scopedSubmissions.filter((submission) => {
    if (!filters.subject) {
      return true;
    }

    const exam = examById.get(submission.examId);
    return Boolean(exam?.subject.toLowerCase().includes(filters.subject.toLowerCase()));
  });

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

  const scoreAccumulator = new Map<string, number[]>();

  filteredSubmissions.forEach((submission) => {
    const row = byMentee.get(submission.userId);
    if (!row) {
      return;
    }

    row.totalSubmissions += 1;
    if (!row.lastSubmittedAt || (submission.submittedAt && submission.submittedAt > row.lastSubmittedAt)) {
      row.lastSubmittedAt = submission.submittedAt;
    }

    const feedbackItem = feedbackBySubmissionId.get(submission._id.toString());
    if (feedbackItem) {
      row.reviewedSubmissions += 1;
      const scores = scoreAccumulator.get(submission.userId) ?? [];
      scores.push(feedbackItem.score);
      scoreAccumulator.set(submission.userId, scores);
    } else {
      row.pendingReviews += 1;
    }
  });

  byMentee.forEach((row) => {
    const scores = scoreAccumulator.get(row.menteeId) ?? [];
    row.averageScore = scores.length
      ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
      : null;
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
  const parsed = performanceFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid performance filters.");
  }

  const rangeStart = getRangeStart(parsed.data.range);
  const [mentee] = await listUsersByIds([menteeId]);
  const submissions = await listSubmittedSubmissionsByUserIdsAll([menteeId]);

  const scopedSubmissions = submissions.filter((submission) => {
    if (!submission.submittedAt) {
      return false;
    }

    if (rangeStart && submission.submittedAt < rangeStart) {
      return false;
    }

    return true;
  });

  const [feedback, exams] = await Promise.all([
    listFeedbackBySubmissionIds(scopedSubmissions.map((submission) => submission._id.toString())),
    listExamsByIds(scopedSubmissions.map((submission) => submission.examId)),
  ]);

  const feedbackBySubmissionId = new Map(feedback.map((item) => [item.submissionId, item]));
  const examById = new Map(exams.map((exam) => [exam._id.toString(), exam]));

  const filteredSubmissions = scopedSubmissions.filter((submission) => {
    if (!parsed.data.subject) {
      return true;
    }

    const exam = examById.get(submission.examId);
    return Boolean(exam?.subject.toLowerCase().includes(parsed.data.subject.toLowerCase()));
  });

  let reviewedSubmissions = 0;
  let pendingReviews = 0;
  const scores: number[] = [];
  const scoresBySubject = new Map<string, number[]>();
  const recentScores: Array<{ submissionId: string; score: number; updatedAt: Date }> = [];

  filteredSubmissions.forEach((submission) => {
    const feedbackItem = feedbackBySubmissionId.get(submission._id.toString());
    if (!feedbackItem) {
      pendingReviews += 1;
      return;
    }

    reviewedSubmissions += 1;
    scores.push(feedbackItem.score);
    recentScores.push({
      submissionId: submission._id.toString(),
      score: feedbackItem.score,
      updatedAt: feedbackItem.updatedAt,
    });

    const subject = examById.get(submission.examId)?.subject;
    if (!subject) {
      return;
    }

    const list = scoresBySubject.get(subject) ?? [];
    list.push(feedbackItem.score);
    scoresBySubject.set(subject, list);
  });

  const weakSubjects = [...scoresBySubject.entries()]
    .map(([subject, subjectScores]) => ({
      subject,
      averageScore:
        Math.round((subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length) * 100) / 100,
    }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5);

  recentScores.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return {
    menteeId,
    menteeName: mentee?.name ?? "Unknown Mentee",
    menteeEmail: mentee?.email ?? "Unknown Email",
    totalSubmissions: filteredSubmissions.length,
    reviewedSubmissions,
    pendingReviews,
    averageScore: scores.length
      ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
      : null,
    weakSubjects,
    recentScores: recentScores.slice(0, 10),
  };
}
