import { findFeedbackBySubmissionId } from "@/repositories/feedback.repository";
import { listExamsByIds } from "@/repositories/exam.repository";
import { listQuestionsByIds } from "@/repositories/question.repository";
import { findSubmissionById } from "@/repositories/submission.repository";
import { listUsersByIds } from "@/repositories/user.repository";

export async function getMenteeSubmissionDetailService(params: {
  submissionId: string;
  menteeId: string;
}) {
  const submission = await findSubmissionById(params.submissionId);
  if (!submission || submission.userId !== params.menteeId) {
    return null;
  }

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
  const questions = resolvedQuestionIds.length ? await listQuestionsByIds(resolvedQuestionIds) : [];
  const questionMap = new Map(questions.map((question) => [question._id.toString(), question]));
  const orderedQuestions = resolvedQuestionIds
    .map((id) => questionMap.get(id))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));
  const feedback = await findFeedbackBySubmissionId(submission._id.toString());
  const [mentor] = feedback ? await listUsersByIds([feedback.mentorId]) : [null];

  return {
    submission,
    exam,
    questions: orderedQuestions,
    feedback,
    mentor,
  };
}
