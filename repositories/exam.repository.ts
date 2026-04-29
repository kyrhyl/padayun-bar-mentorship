import { connectToDatabase } from "@/lib/db/mongodb";
import { ExamModel, type ExamDocument } from "@/models/Exam";

export async function findExamById(examId: string): Promise<ExamDocument | null> {
  await connectToDatabase();
  return ExamModel.findById(examId).lean<ExamDocument>().exec();
}

export async function listPublishedExams(params: {
  page: number;
  limit: number;
  subject?: string;
  topic?: string;
}): Promise<{ items: ExamDocument[]; totalItems: number }> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {
    isPublished: true,
  };

  if (params.subject) {
    filter.subject = { $regex: params.subject, $options: "i" };
  }

  if (params.topic) {
    filter.topic = { $regex: params.topic, $options: "i" };
  }

  const [items, totalItems] = await Promise.all([
    ExamModel.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean<ExamDocument[]>()
      .exec(),
    ExamModel.countDocuments(filter).exec(),
  ]);

  return { items, totalItems };
}

export async function createExam(data: {
  title: string;
  subject: string;
  topic: string;
  questionId?: string;
  questionMode?: "manual" | "random_pool";
  questionIds?: string[];
  poolConfig?: {
    subject?: string;
    topic?: string;
    difficulties?: Array<"easy" | "medium" | "hard">;
    tags?: string[];
    questionCount: number;
  } | null;
  generatedQuestionIds?: string[];
  poolGeneratedAt?: Date | null;
  poolNeedsRegeneration?: boolean;
  durationMinutes: number;
  instructions: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdBy: string;
}): Promise<ExamDocument> {
  await connectToDatabase();
  const created = await ExamModel.create(data);
  return created.toObject();
}

export async function listExamsByIds(examIds: string[]): Promise<ExamDocument[]> {
  await connectToDatabase();

  if (!examIds.length) {
    return [];
  }

  return ExamModel.find({ _id: { $in: examIds } }).lean<ExamDocument[]>().exec();
}

export async function listExamsForAdmin(params: {
  page: number;
  limit: number;
  subject?: string;
  topic?: string;
}): Promise<{ items: ExamDocument[]; totalItems: number }> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (params.subject) {
    filter.subject = { $regex: params.subject, $options: "i" };
  }
  if (params.topic) {
    filter.topic = { $regex: params.topic, $options: "i" };
  }

  const [items, totalItems] = await Promise.all([
    ExamModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean<ExamDocument[]>()
      .exec(),
    ExamModel.countDocuments(filter).exec(),
  ]);

  return { items, totalItems };
}

export async function updateExamById(
  examId: string,
  data: {
    title: string;
    subject: string;
    topic: string;
    questionId?: string;
    questionMode?: "manual" | "random_pool";
    questionIds?: string[];
    poolConfig?: {
      subject?: string;
      topic?: string;
      difficulties?: Array<"easy" | "medium" | "hard">;
      tags?: string[];
      questionCount: number;
    } | null;
    generatedQuestionIds?: string[];
    poolGeneratedAt?: Date | null;
    poolNeedsRegeneration?: boolean;
    durationMinutes: number;
    instructions: string;
    isPublished: boolean;
    publishedAt?: Date | null;
  },
): Promise<ExamDocument | null> {
  await connectToDatabase();

  return ExamModel.findByIdAndUpdate(examId, data, {
    returnDocument: "after",
    runValidators: true,
  })
    .lean<ExamDocument>()
    .exec();
}

export async function deleteExamById(examId: string): Promise<void> {
  await connectToDatabase();
  await ExamModel.findByIdAndDelete(examId).exec();
}

export async function toggleExamPublish(params: {
  examId: string;
  isPublished: boolean;
  publishedAt?: Date | null;
}): Promise<void> {
  await connectToDatabase();
  await ExamModel.updateOne(
    { _id: params.examId },
    {
      $set: {
        isPublished: params.isPublished,
        publishedAt: params.isPublished ? (params.publishedAt ?? new Date()) : null,
      },
    },
  ).exec();
}

export async function findLatestPublishedExamMeta(): Promise<
  Pick<ExamDocument, "_id" | "title" | "publishedAt" | "createdAt"> | null
> {
  await connectToDatabase();
  return ExamModel.findOne({ isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .select({ _id: 1, title: 1, publishedAt: 1, createdAt: 1 })
    .lean<Pick<ExamDocument, "_id" | "title" | "publishedAt" | "createdAt">>()
    .exec();
}

export async function updateExamQuestionGeneration(params: {
  examId: string;
  generatedQuestionIds: string[];
  poolGeneratedAt: Date;
  poolNeedsRegeneration: boolean;
}): Promise<void> {
  await connectToDatabase();
  await ExamModel.updateOne(
    { _id: params.examId },
    {
      $set: {
        generatedQuestionIds: params.generatedQuestionIds,
        poolGeneratedAt: params.poolGeneratedAt,
        poolNeedsRegeneration: params.poolNeedsRegeneration,
      },
    },
  ).exec();
}
