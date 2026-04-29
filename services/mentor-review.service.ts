import { buildPaginationMeta } from "@/lib/utils/pagination";
import { feedbackFormSchema, mentorReviewFilterSchema } from "@/lib/validators/feedback";
import {
  isMentorAssignedToMentee,
  listAssignedMenteeIds,
} from "@/repositories/mentor-assignment.repository";
import {
  findSubmissionById,
  listPendingSubmittedSubmissionsByUserIds,
} from "@/repositories/submission.repository";
import { listExamsByIds } from "@/repositories/exam.repository";
import { listQuestionsByIds } from "@/repositories/question.repository";
import {
  findFeedbackBySubmissionId,
  upsertFeedback,
} from "@/repositories/feedback.repository";
import { listUsersByIds } from "@/repositories/user.repository";

interface MentorReviewItem {
  submissionId: string;
  examId: string;
  examTitle: string;
  subject: string;
  topic: string;
  menteeId: string;
  menteeName: string;
  submittedAt: Date | null;
}

export async function listPendingReviewsService(
  mentorId: string,
  input: Record<string, unknown>,
): Promise<{
  items: MentorReviewItem[];
  meta: ReturnType<typeof buildPaginationMeta>;
  filters: { page: number; limit: number; menteeId?: string; subject?: string };
}> {
  const parsed = mentorReviewFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid pagination filters.");
  }

  const menteeIds = await listAssignedMenteeIds(mentorId);
  const pendingList = await listPendingSubmittedSubmissionsByUserIds({
    userIds: menteeIds,
    page: parsed.data.page,
    limit: parsed.data.limit,
    menteeId: parsed.data.menteeId,
    subject: parsed.data.subject,
  });

  const pagedFilteredPendingSubmissions = pendingList.items;
  const pendingFeedbackCount = pendingList.totalItems;

  const exams = await listExamsByIds(pagedFilteredPendingSubmissions.map((item) => item.examId));
  const users = await listUsersByIds(pagedFilteredPendingSubmissions.map((item) => item.userId));

  const examMap = new Map(exams.map((exam) => [exam._id.toString(), exam]));
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const items: MentorReviewItem[] = pagedFilteredPendingSubmissions.map((submission) => {
    const exam = examMap.get(submission.examId);
    const mentee = userMap.get(submission.userId);

    return {
      submissionId: submission._id.toString(),
      examId: submission.examId,
      examTitle: exam?.title ?? "Unknown Exam",
      subject: exam?.subject ?? "Unknown Subject",
      topic: exam?.topic ?? "Unknown Topic",
      menteeId: submission.userId,
      menteeName: mentee?.name ?? "Unknown Mentee",
      submittedAt: submission.submittedAt,
    };
  });

  return {
    items,
    meta: buildPaginationMeta({
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalItems: pendingFeedbackCount,
    }),
    filters: {
      page: parsed.data.page,
      limit: parsed.data.limit,
      menteeId: parsed.data.menteeId,
      subject: parsed.data.subject,
    },
  };
}

export async function getReviewContextService(mentorId: string, submissionId: string) {
  const submission = await findSubmissionById(submissionId);
  if (!submission || !submission.isSubmitted) {
    return null;
  }

  const isAssigned = await isMentorAssignedToMentee({
    mentorId,
    menteeId: submission.userId,
  });

  if (!isAssigned) {
    throw new Error("Mentor is not assigned to this mentee.");
  }

  const [mentee] = await listUsersByIds([submission.userId]);
  const [exam] = await listExamsByIds([submission.examId]);

  const resolvedQuestionIds = submission.resolvedQuestionIds?.length
    ? submission.resolvedQuestionIds
    : exam?.questionIds?.length
      ? exam.questionIds
      : exam?.generatedQuestionIds?.length
        ? exam.generatedQuestionIds
        : exam?.questionId
          ? [exam.questionId]
          : [];
  const allQuestions = resolvedQuestionIds.length ? await listQuestionsByIds(resolvedQuestionIds) : [];
  const questionMap = new Map(allQuestions.map((question) => [question._id.toString(), question]));
  const questions = resolvedQuestionIds
    .map((questionId) => questionMap.get(questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));

  const feedback = await findFeedbackBySubmissionId(submissionId);

  return {
    submission,
    exam: exam ?? {
      title: "Archived exam",
      subject: "Unknown Subject",
      topic: "Unknown Topic",
      instructions: "Exam details are no longer available.",
    },
    questions,
    mentee,
    feedback,
  };
}

export async function saveFeedbackService(mentorId: string, input: Record<string, unknown>) {
  const parsed = feedbackFormSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid feedback payload.");
  }

  const submission = await findSubmissionById(parsed.data.submissionId);
  if (!submission || !submission.isSubmitted) {
    throw new Error("Submission not found.");
  }

  const isAssigned = await isMentorAssignedToMentee({
    mentorId,
    menteeId: submission.userId,
  });

  if (!isAssigned) {
    throw new Error("Mentor is not assigned to this mentee.");
  }

  const score =
    parsed.data.correctResponse +
    parsed.data.law +
    parsed.data.reasoning +
    parsed.data.logic +
    parsed.data.grammar;

  return upsertFeedback({
    submissionId: parsed.data.submissionId,
    mentorId,
    score,
    rubric: {
      correctResponse: parsed.data.correctResponse,
      law: parsed.data.law,
      reasoning: parsed.data.reasoning,
      logic: parsed.data.logic,
      grammar: parsed.data.grammar,
    },
    comments: parsed.data.comments,
  });
}
