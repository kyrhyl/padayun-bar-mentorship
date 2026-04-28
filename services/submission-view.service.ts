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
  const [question] = exam ? await listQuestionsByIds([exam.questionId]) : [null];
  const feedback = await findFeedbackBySubmissionId(submission._id.toString());
  const [mentor] = feedback ? await listUsersByIds([feedback.mentorId]) : [null];

  return {
    submission,
    exam,
    question,
    feedback,
    mentor,
  };
}
