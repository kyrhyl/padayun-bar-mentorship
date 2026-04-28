import { buildPaginationMeta } from "@/lib/utils/pagination";
import {
  questionFilterSchema,
  questionSchema,
  type QuestionInput,
} from "@/lib/validators/question";
import {
  createQuestion,
  deleteQuestion,
  findQuestionById,
  listQuestions,
  updateQuestion,
} from "@/repositories/question.repository";

export async function createQuestionService(input: QuestionInput & { createdBy: string }) {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid question data.");
  }

  return createQuestion({
    ...parsed.data,
    createdBy: input.createdBy,
  });
}

export async function updateQuestionService(questionId: string, input: QuestionInput) {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid question data.");
  }

  const updatedQuestion = await updateQuestion(questionId, parsed.data);
  if (!updatedQuestion) {
    throw new Error("Question not found.");
  }

  return updatedQuestion;
}

export async function deleteQuestionService(questionId: string) {
  await deleteQuestion(questionId);
}

export async function findQuestionByIdService(questionId: string) {
  return findQuestionById(questionId);
}

export async function listQuestionsService(input: Record<string, unknown>) {
  const parsed = questionFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid filters.");
  }

  const { items, totalItems } = await listQuestions(parsed.data);

  return {
    items,
    meta: buildPaginationMeta({
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalItems,
    }),
    filters: parsed.data,
  };
}
