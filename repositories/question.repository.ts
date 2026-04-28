import { connectToDatabase } from "@/lib/db/mongodb";
import { QuestionModel, type QuestionDocument } from "@/models/Question";

interface ListQuestionsParams {
  subject?: string;
  topic?: string;
  difficulty?: QuestionDocument["difficulty"];
  page: number;
  limit: number;
}

export async function createQuestion(data: {
  subject: string;
  topic: string;
  difficulty: QuestionDocument["difficulty"];
  tags: string[];
  prompt: string;
  createdBy: string;
}): Promise<QuestionDocument> {
  await connectToDatabase();
  const question = await QuestionModel.create(data);
  return question.toObject();
}

export async function updateQuestion(
  questionId: string,
  data: {
    subject: string;
    topic: string;
    difficulty: QuestionDocument["difficulty"];
    tags: string[];
    prompt: string;
  },
): Promise<QuestionDocument | null> {
  await connectToDatabase();

  return QuestionModel.findByIdAndUpdate(questionId, data, {
    returnDocument: "after",
    runValidators: true,
  })
    .lean<QuestionDocument>()
    .exec();
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await connectToDatabase();
  await QuestionModel.findByIdAndDelete(questionId).exec();
}

export async function findQuestionById(questionId: string): Promise<QuestionDocument | null> {
  await connectToDatabase();
  return QuestionModel.findById(questionId).lean<QuestionDocument>().exec();
}

export async function listQuestions(params: ListQuestionsParams): Promise<{
  items: QuestionDocument[];
  totalItems: number;
}> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};

  if (params.subject) {
    filter.subject = { $regex: params.subject, $options: "i" };
  }

  if (params.topic) {
    filter.topic = { $regex: params.topic, $options: "i" };
  }

  if (params.difficulty) {
    filter.difficulty = params.difficulty;
  }

  const [items, totalItems] = await Promise.all([
    QuestionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean<QuestionDocument[]>()
      .exec(),
    QuestionModel.countDocuments(filter).exec(),
  ]);

  return { items, totalItems };
}

export async function listQuestionsByIds(questionIds: string[]): Promise<QuestionDocument[]> {
  await connectToDatabase();

  if (!questionIds.length) {
    return [];
  }

  return QuestionModel.find({ _id: { $in: questionIds } }).lean<QuestionDocument[]>().exec();
}
