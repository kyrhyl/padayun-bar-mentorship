import { buildPaginationMeta } from "@/lib/utils/pagination";
import { listPageSchema, mentorReviewFilterSchema } from "@/lib/validators/feedback";
import { listAssignedMenteeIds } from "@/repositories/mentor-assignment.repository";
import {
  findFeedbackBySubmissionId,
  listFeedbackByMentorIdAll,
  listFeedbackBySubmissionIds,
} from "@/repositories/feedback.repository";
import {
  listSubmittedSubmissionsByUserIdsAll,
  listSubmissionsByUserId,
} from "@/repositories/submission.repository";
import { listExamsByIds } from "@/repositories/exam.repository";
import { listUsersByIds } from "@/repositories/user.repository";

export async function getMenteeDashboardService(
  menteeId: string,
  input: Record<string, unknown>,
): Promise<{
  recentSubmissions: Awaited<ReturnType<typeof listSubmissionsByUserId>>["items"];
  recentScores: Array<{ submissionId: string; score: number }>;
  weakSubjects: Array<{ subject: string; averageScore: number }>;
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const parsed = listPageSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid dashboard filters.");
  }

  const submissions = await listSubmissionsByUserId(menteeId, parsed.data);
  const feedbackList = await Promise.all(
    submissions.items.map((submission) => findFeedbackBySubmissionId(submission._id.toString())),
  );

  const recentScores = feedbackList
    .map((feedback, index) => ({ feedback, submission: submissions.items[index] }))
    .filter((entry): entry is { feedback: NonNullable<typeof entry.feedback>; submission: typeof entry.submission } =>
      Boolean(entry.feedback),
    )
    .map((entry) => ({
      submissionId: entry.submission._id.toString(),
      score: entry.feedback.score,
    }));

  const reviewedPairs = submissions.items
    .map((submission, index) => ({ submission, feedback: feedbackList[index] }))
    .filter(
      (
        entry,
      ): entry is {
        submission: (typeof submissions.items)[number];
        feedback: NonNullable<(typeof feedbackList)[number]>;
      } => Boolean(entry.feedback),
    );

  const exams = await listExamsByIds(reviewedPairs.map((entry) => entry.submission.examId));
  const examMap = new Map(exams.map((exam) => [exam._id.toString(), exam]));

  const scoresBySubject = new Map<string, number[]>();
  reviewedPairs.forEach((entry) => {
    const exam = examMap.get(entry.submission.examId);
    const feedback = entry.feedback;
    if (!exam || !feedback) {
      return;
    }

    const list = scoresBySubject.get(exam.subject) ?? [];
    list.push(feedback.score);
    scoresBySubject.set(exam.subject, list);
  });

  const weakSubjects = [...scoresBySubject.entries()]
    .map(([subject, scores]) => ({
      subject,
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);

  return {
    recentSubmissions: submissions.items,
    recentScores,
    weakSubjects,
    meta: buildPaginationMeta({
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalItems: submissions.totalItems,
    }),
  };
}

export async function getMentorDashboardService(
  mentorId: string,
  input: Record<string, unknown>,
): Promise<{
  assignedMentees: Array<{ id: string; name: string; email: string }>;
  pendingReviews: number;
  recentReviewed: Array<{ submissionId: string; score: number; updatedAt: Date }>;
  reviewedMeta: ReturnType<typeof buildPaginationMeta>;
  reviewedFilters: { page: number; limit: number; menteeId?: string; subject?: string };
}> {
  const parsed = mentorReviewFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid dashboard filters.");
  }

  const menteeIds = await listAssignedMenteeIds(mentorId);
  const mentees = await listUsersByIds(menteeIds);

  const submissions = await listSubmittedSubmissionsByUserIdsAll(menteeIds);

  const feedback = await listFeedbackBySubmissionIds(
    submissions.map((submission) => submission._id.toString()),
  );

  const reviewedIds = new Set(feedback.map((item) => item.submissionId));
  const pendingReviews = submissions.filter((submission) => {
    return submission.isSubmitted && !reviewedIds.has(submission._id.toString());
  }).length;

  const reviewedAll = await listFeedbackByMentorIdAll(mentorId);

  const reviewedSubmissions = submissions.filter((submission) =>
    reviewedAll.some((item) => item.submissionId === submission._id.toString()),
  );
  const examMap = new Map((await listExamsByIds(reviewedSubmissions.map((s) => s.examId))).map((e) => [e._id.toString(), e]));

  const filteredReviewed = reviewedAll.filter((item) => {
    const submission = reviewedSubmissions.find((s) => s._id.toString() === item.submissionId);
    if (!submission) return false;

    if (parsed.data.menteeId && submission.userId !== parsed.data.menteeId) {
      return false;
    }

    if (parsed.data.subject) {
      const exam = examMap.get(submission.examId);
      if (!exam || !exam.subject.toLowerCase().includes(parsed.data.subject.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const reviewedItems = filteredReviewed.slice(
    (parsed.data.page - 1) * parsed.data.limit,
    parsed.data.page * parsed.data.limit,
  );

  return {
    assignedMentees: mentees.map((mentee) => ({
      id: mentee._id.toString(),
      name: mentee.name,
      email: mentee.email,
    })),
    pendingReviews,
    recentReviewed: reviewedItems.map((item) => ({
      submissionId: item.submissionId,
      score: item.score,
      updatedAt: item.updatedAt,
    })),
    reviewedMeta: buildPaginationMeta({
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalItems: filteredReviewed.length,
    }),
    reviewedFilters: {
      page: parsed.data.page,
      limit: parsed.data.limit,
      menteeId: parsed.data.menteeId,
      subject: parsed.data.subject,
    },
  };
}
