import { buildPaginationMeta } from "@/lib/utils/pagination";
import { examListFiltersSchema, examSchema, type ExamInput } from "@/lib/validators/exam";
import { findQuestionById } from "@/repositories/question.repository";
import {
  createExam,
  deleteExamById,
  findExamById,
  listExamsForAdmin,
  listPublishedExams,
  toggleExamPublish,
  updateExamById,
} from "@/repositories/exam.repository";

export async function listPublishedExamsService(input: Record<string, unknown>) {
  const parsed = examListFiltersSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid exam filters.");
  }

  const { items, totalItems } = await listPublishedExams(parsed.data);

  return {
    items,
    filters: parsed.data,
    meta: buildPaginationMeta({
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalItems,
    }),
  };
}

export async function getExamWithQuestionService(examId: string) {
  const exam = await findExamById(examId);
  if (!exam || !exam.isPublished) {
    return null;
  }

  const question = await findQuestionById(exam.questionId);
  if (!question) {
    throw new Error("Question linked to this exam was not found.");
  }

  return {
    exam,
    question,
  };
}

export async function listExamsForAdminService(input: Record<string, unknown>) {
  const parsed = examListFiltersSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid exam filters.");
  }

  const { items, totalItems } = await listExamsForAdmin(parsed.data);

  return {
    items,
    filters: parsed.data,
    meta: buildPaginationMeta({
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalItems,
    }),
  };
}

export async function createExamService(input: ExamInput & { createdBy: string }) {
  const parsed = examSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid exam payload.");
  }

  return createExam({
    ...parsed.data,
    createdBy: input.createdBy,
  });
}

export async function updateExamService(examId: string, input: ExamInput) {
  const parsed = examSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid exam payload.");
  }

  const updated = await updateExamById(examId, parsed.data);
  if (!updated) {
    throw new Error("Exam not found.");
  }

  return updated;
}

export async function deleteExamService(examId: string) {
  await deleteExamById(examId);
}

export async function toggleExamPublishService(examId: string, isPublished: boolean) {
  await toggleExamPublish(examId, isPublished);
}
