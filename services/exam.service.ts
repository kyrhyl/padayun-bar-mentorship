import { buildPaginationMeta } from "@/lib/utils/pagination";
import { examListFiltersSchema, examSchema, type ExamInput } from "@/lib/validators/exam";
import { findQuestionById, listQuestionIdsByPool, listQuestionsByIds } from "@/repositories/question.repository";
import {
  createExam,
  deleteExamById,
  findExamById,
  findLatestPublishedExamMeta,
  listExamsForAdmin,
  listPublishedExams,
  toggleExamPublish,
  updateExamQuestionGeneration,
  updateExamById,
} from "@/repositories/exam.repository";
import {
  countInProgressSubmissionsByExam,
  countSubmissionsByExam,
} from "@/repositories/submission.repository";
import { updateLastSeenPublishedExamAt } from "@/repositories/user.repository";

function normalizeExamInput(input: ExamInput) {
  if ("questionMode" in input && input.questionMode === "manual") {
    return {
      ...input,
      questionId: input.questionIds[0],
      poolConfig: null,
      generatedQuestionIds: [],
      poolGeneratedAt: null,
      poolNeedsRegeneration: false,
    };
  }

  if ("questionMode" in input && input.questionMode === "random_pool") {
    return {
      ...input,
      questionId: "",
      questionIds: [],
      generatedQuestionIds: [],
      poolGeneratedAt: null,
      poolNeedsRegeneration: true,
    };
  }

  return {
    ...input,
    questionMode: "manual" as const,
    questionIds: [input.questionId],
    poolConfig: null,
    generatedQuestionIds: [],
    poolGeneratedAt: null,
    poolNeedsRegeneration: false,
  };
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

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

  const resolvedQuestionId =
    exam.questionId || exam.generatedQuestionIds?.[0] || exam.questionIds?.[0];
  if (!resolvedQuestionId) {
    throw new Error("Exam has no resolved question.");
  }

  const question = await findQuestionById(resolvedQuestionId);
  if (!question) {
    throw new Error("Question linked to this exam was not found.");
  }

  return {
    exam,
    question,
  };
}

export function getResolvedQuestionIdsForExam(exam: {
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

export async function getExamWithQuestionsService(examId: string) {
  const exam = await findExamById(examId);
  if (!exam || !exam.isPublished) {
    return null;
  }

  let resolvedIds = getResolvedQuestionIdsForExam(exam);
  if (!resolvedIds.length && exam.questionMode === "random_pool" && exam.poolConfig) {
    return null;
  }

  if (!resolvedIds.length) {
    return null;
  }

  const questions = await listQuestionsByIds(resolvedIds);
  const questionMap = new Map(questions.map((question) => [question._id.toString(), question]));
  const orderedQuestions = resolvedIds
    .map((id) => questionMap.get(id))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));

  if (!orderedQuestions.length) {
    return null;
  }

  return {
    exam,
    questions: orderedQuestions,
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

  const normalized = normalizeExamInput(parsed.data);

  return createExam({
    ...normalized,
    publishedAt: normalized.isPublished ? new Date() : null,
    createdBy: input.createdBy,
  });
}

export async function updateExamService(examId: string, input: ExamInput) {
  const parsed = examSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid exam payload.");
  }

  const existingExam = await findExamById(examId);
  if (!existingExam) {
    throw new Error("Exam not found.");
  }

  const normalized = normalizeExamInput(parsed.data);

  const payload =
    normalized.questionMode === "random_pool"
      ? (() => {
    const previousPool = JSON.stringify(existingExam.poolConfig ?? null);
    const nextPool = JSON.stringify(normalized.poolConfig ?? null);
    const poolChanged = previousPool !== nextPool;

        return {
          ...normalized,
          generatedQuestionIds: (existingExam.generatedQuestionIds ?? []) as string[],
          poolGeneratedAt: (existingExam.poolGeneratedAt ?? null) as Date | null,
          poolNeedsRegeneration:
            poolChanged || existingExam.poolNeedsRegeneration || !(existingExam.generatedQuestionIds?.length),
        };
      })()
      : normalized;

  const nextPublishedAt = payload.isPublished
    ? existingExam.publishedAt ?? (!existingExam.isPublished ? new Date() : null)
    : null;

  const updated = await updateExamById(examId, {
    ...payload,
    publishedAt: nextPublishedAt,
  });
  if (!updated) {
    throw new Error("Exam not found.");
  }

  return updated;
}

export async function deleteExamService(examId: string) {
  const linkedSubmissions = await countSubmissionsByExam(examId);
  if (linkedSubmissions > 0) {
    throw new Error("Cannot delete exam with submissions. Unpublish it instead.");
  }

  await deleteExamById(examId);
}

export async function toggleExamPublishService(examId: string, isPublished: boolean) {
  let publishTimestamp: Date | null = null;

  if (isPublished) {
    const exam = await findExamById(examId);
    if (!exam) {
      throw new Error("Exam not found.");
    }

    if (exam.questionMode === "random_pool" && !(exam.generatedQuestionIds?.length)) {
      await regenerateExamQuestionSetService(examId);
    }

    publishTimestamp = exam.publishedAt ?? new Date();
  }

  await toggleExamPublish({
    examId,
    isPublished,
    publishedAt: publishTimestamp,
  });
}

export async function getLatestPublishedExamNoticeForMentee(user: {
  role: "admin" | "mentor" | "mentee";
  lastSeenPublishedExamAt?: Date | null;
}) {
  if (user.role !== "mentee") {
    return null;
  }

  const latest = await findLatestPublishedExamMeta();
  if (!latest) {
    return null;
  }

  const latestPublishedAt = latest.publishedAt ?? latest.createdAt;
  const lastSeen = user.lastSeenPublishedExamAt;
  const hasNew = !lastSeen || latestPublishedAt.getTime() > lastSeen.getTime();

  if (!hasNew) {
    return null;
  }

  return {
    examId: latest._id.toString(),
    examTitle: latest.title,
    publishedAt: latestPublishedAt,
  };
}

export async function markPublishedExamNoticeSeenService(menteeId: string) {
  const latest = await findLatestPublishedExamMeta();
  if (!latest) {
    return;
  }

  await updateLastSeenPublishedExamAt({
    userId: menteeId,
    seenAt: latest.publishedAt ?? latest.createdAt,
  });
}

export async function regenerateExamQuestionSetService(examId: string) {
  const exam = await findExamById(examId);
  if (!exam) {
    throw new Error("Exam not found.");
  }

  if (exam.questionMode !== "random_pool" || !exam.poolConfig) {
    throw new Error("Exam is not configured for random pool.");
  }

  if (exam.isPublished) {
    throw new Error("Unpublish exam before regenerating question set.");
  }

  const inProgressCount = await countInProgressSubmissionsByExam(examId);
  if (inProgressCount > 0) {
    throw new Error("Cannot regenerate while submissions are in progress.");
  }

  const poolQuestionIds = await listQuestionIdsByPool(exam.poolConfig);
  if (poolQuestionIds.length < exam.poolConfig.questionCount) {
    throw new Error("Not enough questions in pool to generate the configured set.");
  }

  const generatedQuestionIds = shuffle(poolQuestionIds).slice(0, exam.poolConfig.questionCount);

  await updateExamQuestionGeneration({
    examId,
    generatedQuestionIds,
    poolGeneratedAt: new Date(),
    poolNeedsRegeneration: false,
  });

  return generatedQuestionIds;
}
