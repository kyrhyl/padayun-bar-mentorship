import { buildPaginationMeta } from "@/lib/utils/pagination";
import { feedbackFormSchema, mentorReviewFilterSchema } from "@/lib/validators/feedback";
import {
  isMentorAssignedToMentee,
  listAssignedMenteeIds,
} from "@/repositories/mentor-assignment.repository";
import {
  findSubmissionById,
  listSubmittedSubmissionsByUserIdsAll,
} from "@/repositories/submission.repository";
import { listExamsByIds } from "@/repositories/exam.repository";
import { listQuestionsByIds } from "@/repositories/question.repository";
import { findFeedbackBySubmissionId, upsertFeedback } from "@/repositories/feedback.repository";
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
  const submitted = await listSubmittedSubmissionsByUserIdsAll(menteeIds);

  const feedbackList = await Promise.all(
    submitted.map((item) => findFeedbackBySubmissionId(item._id.toString())),
  );

  const pendingSubmissions = submitted.filter((_, index) => !feedbackList[index]);

  const examsAll = await listExamsByIds(pendingSubmissions.map((item) => item.examId));
  const examAllMap = new Map(examsAll.map((exam) => [exam._id.toString(), exam]));

  const filteredPending = pendingSubmissions.filter((submission) => {
    if (parsed.data.menteeId && submission.userId !== parsed.data.menteeId) {
      return false;
    }

    if (parsed.data.subject) {
      const exam = examAllMap.get(submission.examId);
      if (!exam || !exam.subject.toLowerCase().includes(parsed.data.subject.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const pagedFilteredPendingSubmissions = filteredPending.slice(
    (parsed.data.page - 1) * parsed.data.limit,
    parsed.data.page * parsed.data.limit,
  );
  const pendingFeedbackCount = filteredPending.length;

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

  if (!exam) {
    throw new Error("Exam not found.");
  }

  const [question] = await listQuestionsByIds([exam.questionId]);
  if (!question) {
    throw new Error("Question not found.");
  }

  const feedback = await findFeedbackBySubmissionId(submissionId);

  return {
    submission,
    exam,
    question,
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

  const score = Math.round(
    (parsed.data.conclusion + parsed.data.law + parsed.data.reasoning) / 3,
  );

  return upsertFeedback({
    submissionId: parsed.data.submissionId,
    mentorId,
    score,
    clr: {
      conclusion: parsed.data.conclusion,
      law: parsed.data.law,
      reasoning: parsed.data.reasoning,
    },
    comments: parsed.data.comments,
  });
}
