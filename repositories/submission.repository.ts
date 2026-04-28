import { connectToDatabase } from "@/lib/db/mongodb";
import { SubmissionModel, type SubmissionDocument } from "@/models/Submission";
import type { PipelineStage } from "mongoose";

interface PendingSubmissionListParams {
  userIds: string[];
  page: number;
  limit: number;
  menteeId?: string;
  subject?: string;
}

export async function findSubmissionById(
  submissionId: string,
): Promise<SubmissionDocument | null> {
  await connectToDatabase();
  return SubmissionModel.findById(submissionId).lean<SubmissionDocument>().exec();
}

export async function findSubmissionByUserAndExam(params: {
  userId: string;
  examId: string;
}): Promise<SubmissionDocument | null> {
  await connectToDatabase();
  return SubmissionModel.findOne(params).lean<SubmissionDocument>().exec();
}

export async function createSubmission(data: {
  userId: string;
  examId: string;
  answer?: string;
  resolvedQuestionIds?: string[];
  answers?: Array<{ questionId: string; answer: string; lastSavedAt?: Date | null }>;
}): Promise<SubmissionDocument> {
  await connectToDatabase();
  const created = await SubmissionModel.create(data);
  return created.toObject();
}

export async function countInProgressSubmissionsByExam(examId: string): Promise<number> {
  await connectToDatabase();
  return SubmissionModel.countDocuments({ examId, isSubmitted: false }).exec();
}

export async function updateSubmissionAnswer(params: {
  submissionId: string;
  userId: string;
  answer: string;
  questionId?: string;
  savedAt: Date;
}): Promise<SubmissionDocument | null> {
  await connectToDatabase();

  const submission = await SubmissionModel.findOne({
    _id: params.submissionId,
    userId: params.userId,
    isSubmitted: false,
  }).exec();

  if (!submission) {
    return null;
  }

  submission.answer = params.answer;
  submission.lastSavedAt = params.savedAt;

  if (params.questionId) {
    const answerIndex = submission.answers.findIndex((item) => item.questionId === params.questionId);
    if (answerIndex >= 0) {
      submission.answers[answerIndex].answer = params.answer;
      submission.answers[answerIndex].lastSavedAt = params.savedAt;
    } else {
      submission.answers.push({ questionId: params.questionId, answer: params.answer, lastSavedAt: params.savedAt });
    }
  }

  await submission.save();
  return submission.toObject() as SubmissionDocument;
}

export async function submitSubmission(params: {
  submissionId: string;
  userId: string;
  submittedAt: Date;
}): Promise<SubmissionDocument | null> {
  await connectToDatabase();

  return SubmissionModel.findOneAndUpdate(
    {
      _id: params.submissionId,
      userId: params.userId,
      isSubmitted: false,
    },
    {
      $set: {
        isSubmitted: true,
        submittedAt: params.submittedAt,
        lastSavedAt: params.submittedAt,
      },
    },
    {
      returnDocument: "after",
      upsert: false,
      runValidators: true,
    },
  )
    .lean<SubmissionDocument>()
    .exec();
}

export async function logSubmissionEvent(params: {
  submissionId: string;
  userId: string;
  type: "tab_switch";
  at: Date;
}): Promise<void> {
  await connectToDatabase();

  await SubmissionModel.updateOne(
    {
      _id: params.submissionId,
      userId: params.userId,
      isSubmitted: false,
    },
    {
      $push: {
        suspiciousEvents: {
          $each: [{ type: params.type, at: params.at }],
          $slice: -100,
        },
      },
    },
    { upsert: false },
  ).exec();
}

export async function listSubmittedSubmissionsByUserIds(params: {
  userIds: string[];
  page: number;
  limit: number;
}): Promise<{ items: SubmissionDocument[]; totalItems: number }> {
  await connectToDatabase();

  if (!params.userIds.length) {
    return { items: [], totalItems: 0 };
  }

  const filter = {
    userId: { $in: params.userIds },
    isSubmitted: true,
  };

  const [items, totalItems] = await Promise.all([
    SubmissionModel.find(filter)
      .sort({ submittedAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean<SubmissionDocument[]>()
      .exec(),
    SubmissionModel.countDocuments(filter).exec(),
  ]);

  return { items, totalItems };
}

export async function listSubmittedSubmissionsByUserIdsAll(
  userIds: string[],
): Promise<SubmissionDocument[]> {
  await connectToDatabase();

  if (!userIds.length) {
    return [];
  }

  return SubmissionModel.find({
    userId: { $in: userIds },
    isSubmitted: true,
  })
    .sort({ submittedAt: -1 })
    .lean<SubmissionDocument[]>()
    .exec();
}

export async function listSubmissionsByUserIds(params: {
  userIds: string[];
  page: number;
  limit: number;
}): Promise<{ items: SubmissionDocument[]; totalItems: number }> {
  await connectToDatabase();

  if (!params.userIds.length) {
    return { items: [], totalItems: 0 };
  }

  const filter = {
    userId: { $in: params.userIds },
  };

  const [items, totalItems] = await Promise.all([
    SubmissionModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean<SubmissionDocument[]>()
      .exec(),
    SubmissionModel.countDocuments(filter).exec(),
  ]);

  return { items, totalItems };
}

export async function listSubmissionsByUserId(
  userId: string,
  params: { page: number; limit: number },
): Promise<{ items: SubmissionDocument[]; totalItems: number }> {
  await connectToDatabase();

  const filter = { userId };

  const [items, totalItems] = await Promise.all([
    SubmissionModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean<SubmissionDocument[]>()
      .exec(),
    SubmissionModel.countDocuments(filter).exec(),
  ]);

  return { items, totalItems };
}

export async function listPendingSubmittedSubmissionsByUserIds(params: PendingSubmissionListParams): Promise<{
  items: SubmissionDocument[];
  totalItems: number;
}> {
  await connectToDatabase();

  if (!params.userIds.length) {
    return { items: [], totalItems: 0 };
  }

  const submissionMatch: Record<string, unknown> = {
    isSubmitted: true,
    userId: { $in: params.userIds },
  };

  if (params.menteeId) {
    submissionMatch.userId = params.menteeId;
  }

  const subjectRegex = params.subject ? new RegExp(params.subject, "i") : null;

  const basePipeline: PipelineStage[] = [
    { $match: submissionMatch },
    {
      $lookup: {
        from: "feedbacks",
        let: { submissionId: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$submissionId", "$$submissionId"] },
            },
          },
        ],
        as: "feedback",
      },
    },
    {
      $match: {
        feedback: { $eq: [] },
      },
    },
  ];

  if (subjectRegex) {
    basePipeline.push(
      {
        $lookup: {
          from: "exams",
          let: { examId: "$examId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toString: "$_id" }, "$$examId"] },
              },
            },
          ],
          as: "exam",
        },
      },
      { $unwind: "$exam" },
      { $match: { "exam.subject": { $regex: subjectRegex } } },
    );
  }

  const [items, totalResult] = await Promise.all([
    SubmissionModel.aggregate([
      ...basePipeline,
      { $sort: { submittedAt: -1 } },
      { $skip: (params.page - 1) * params.limit },
      { $limit: params.limit },
      { $project: { feedback: 0, exam: 0 } },
    ]).exec(),
    SubmissionModel.aggregate<{ totalItems: number }>([
      ...basePipeline,
      { $count: "totalItems" },
    ]).exec(),
  ]);

  return {
    items: items as SubmissionDocument[],
    totalItems: totalResult[0]?.totalItems ?? 0,
  };
}
