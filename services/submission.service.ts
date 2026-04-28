import {
  createSubmission,
  findSubmissionById,
  findSubmissionByUserAndExam,
  logSubmissionEvent,
  submitSubmission,
  updateSubmissionAnswer,
} from "@/repositories/submission.repository";
import { findExamById } from "@/repositories/exam.repository";

function resolveQuestionIds(exam: {
  questionMode?: "manual" | "random_pool";
  questionId: string;
  questionIds?: string[];
  generatedQuestionIds?: string[];
}) {
  if (exam.questionMode === "random_pool") {
    return exam.generatedQuestionIds ?? [];
  }

  if (exam.questionIds?.length) {
    return exam.questionIds;
  }

  return exam.questionId ? [exam.questionId] : [];
}

export async function getOrCreateSubmissionService(params: {
  userId: string;
  examId: string;
}) {
  const existing = await findSubmissionByUserAndExam(params);
  if (existing) {
    return existing;
  }

  const exam = await findExamById(params.examId);
  if (!exam) {
    throw new Error("Exam not found.");
  }

  const resolvedQuestionIds = resolveQuestionIds(exam);
  if (!resolvedQuestionIds.length) {
    throw new Error("Exam has no resolved questions.");
  }

  return createSubmission({
    userId: params.userId,
    examId: params.examId,
    answer: " ",
    resolvedQuestionIds,
    answers: resolvedQuestionIds.map((questionId) => ({ questionId, answer: " ", lastSavedAt: null })),
  });
}

export async function autosaveSubmissionService(params: {
  submissionId: string;
  userId: string;
  answer: string;
  questionId?: string;
  savedAt: Date;
}) {
  const updated = await updateSubmissionAnswer(params);
  if (!updated) {
    const existing = await findSubmissionById(params.submissionId);
    if (!existing) {
      throw new Error("Submission not found.");
    }

    if (existing.isSubmitted) {
      throw new Error("Submission already locked.");
    }

    throw new Error("Autosave failed.");
  }

  return updated;
}

export async function submitSubmissionService(params: {
  submissionId: string;
  userId: string;
}) {
  const submission = await submitSubmission({
    submissionId: params.submissionId,
    userId: params.userId,
    submittedAt: new Date(),
  });

  if (!submission) {
    const existing = await findSubmissionById(params.submissionId);
    if (!existing) {
      throw new Error("Submission not found.");
    }

    if (existing.isSubmitted) {
      return existing;
    }

    throw new Error("Submission failed.");
  }

  return submission;
}

export async function logTabSwitchService(params: {
  submissionId: string;
  userId: string;
  at: Date;
}) {
  await logSubmissionEvent({
    ...params,
    type: "tab_switch",
  });
}
