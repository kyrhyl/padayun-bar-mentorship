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

interface PerformanceAggregateParams {
  userIds: string[];
  rangeStart?: Date | null;
  subject?: string;
}

interface MenteePerformanceDetailAggregateParams {
  userId: string;
  rangeStart?: Date | null;
  subject?: string;
  weakLimit: number;
  recentLimit: number;
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

  const filter = {
    _id: params.submissionId,
    userId: params.userId,
    isSubmitted: false,
  };

  if (!params.questionId) {
    return SubmissionModel.findOneAndUpdate(
      filter,
      {
        $set: {
          answer: params.answer,
          lastSavedAt: params.savedAt,
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

  const updatedExisting = await SubmissionModel.findOneAndUpdate(
    {
      ...filter,
      "answers.questionId": params.questionId,
    },
    {
      $set: {
        answer: params.answer,
        lastSavedAt: params.savedAt,
        "answers.$.answer": params.answer,
        "answers.$.lastSavedAt": params.savedAt,
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

  if (updatedExisting) {
    return updatedExisting;
  }

  return SubmissionModel.findOneAndUpdate(
    filter,
    {
      $set: {
        answer: params.answer,
        lastSavedAt: params.savedAt,
      },
      $push: {
        answers: {
          questionId: params.questionId,
          answer: params.answer,
          lastSavedAt: params.savedAt,
        },
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

export async function aggregateSubmissionPerformanceByUserIds(params: PerformanceAggregateParams): Promise<
  Array<{
    userId: string;
    totalSubmissions: number;
    reviewedSubmissions: number;
    pendingReviews: number;
    averageScore: number | null;
    lastSubmittedAt: Date | null;
  }>
> {
  await connectToDatabase();

  if (!params.userIds.length) {
    return [];
  }

  const submissionMatch: Record<string, unknown> = {
    userId: { $in: params.userIds },
    isSubmitted: true,
    submittedAt: { $ne: null },
  };

  if (params.rangeStart) {
    submissionMatch.submittedAt = {
      $gte: params.rangeStart,
    };
  }

  const subjectRegex = params.subject ? new RegExp(params.subject, "i") : null;

  const pipeline: PipelineStage[] = [
    { $match: submissionMatch },
    {
      $addFields: {
        submissionIdStr: { $toString: "$_id" },
      },
    },
  ];

  if (subjectRegex) {
    pipeline.push(
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

  pipeline.push(
    {
      $lookup: {
        from: "feedbacks",
        let: { submissionId: "$submissionIdStr" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$submissionId", "$$submissionId"] },
            },
          },
          { $project: { score: 1 } },
        ],
        as: "feedback",
      },
    },
    {
      $addFields: {
        feedbackScore: { $ifNull: [{ $arrayElemAt: ["$feedback.score", 0] }, null] },
      },
    },
    {
      $group: {
        _id: "$userId",
        totalSubmissions: { $sum: 1 },
        reviewedSubmissions: {
          $sum: {
            $cond: [{ $ne: ["$feedbackScore", null] }, 1, 0],
          },
        },
        pendingReviews: {
          $sum: {
            $cond: [{ $eq: ["$feedbackScore", null] }, 1, 0],
          },
        },
        averageScore: { $avg: "$feedbackScore" },
        lastSubmittedAt: { $max: "$submittedAt" },
      },
    },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        totalSubmissions: 1,
        reviewedSubmissions: 1,
        pendingReviews: 1,
        averageScore: {
          $cond: [
            { $eq: ["$averageScore", null] },
            null,
            { $round: ["$averageScore", 2] },
          ],
        },
        lastSubmittedAt: 1,
      },
    },
  );

  return SubmissionModel.aggregate(pipeline).exec();
}

export async function aggregateMenteePerformanceDetail(params: MenteePerformanceDetailAggregateParams): Promise<{
  totalSubmissions: number;
  reviewedSubmissions: number;
  pendingReviews: number;
  averageScore: number | null;
  weakSubjects: Array<{ subject: string; averageScore: number }>;
  recentScores: Array<{ submissionId: string; score: number; updatedAt: Date }>;
}> {
  await connectToDatabase();

  const submissionMatch: Record<string, unknown> = {
    userId: params.userId,
    isSubmitted: true,
    submittedAt: { $ne: null },
  };

  if (params.rangeStart) {
    submissionMatch.submittedAt = { $gte: params.rangeStart };
  }

  const subjectRegex = params.subject ? new RegExp(params.subject, "i") : null;

  const pipeline: PipelineStage[] = [
    { $match: submissionMatch },
    {
      $addFields: {
        submissionIdStr: { $toString: "$_id" },
      },
    },
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
          { $project: { subject: 1 } },
        ],
        as: "exam",
      },
    },
    { $unwind: "$exam" },
  ];

  if (subjectRegex) {
    pipeline.push({ $match: { "exam.subject": { $regex: subjectRegex } } });
  }

  pipeline.push(
    {
      $lookup: {
        from: "feedbacks",
        let: { submissionId: "$submissionIdStr" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$submissionId", "$$submissionId"] },
            },
          },
          { $project: { score: 1, updatedAt: 1 } },
        ],
        as: "feedback",
      },
    },
    {
      $addFields: {
        feedbackScore: { $ifNull: [{ $arrayElemAt: ["$feedback.score", 0] }, null] },
        feedbackUpdatedAt: { $ifNull: [{ $arrayElemAt: ["$feedback.updatedAt", 0] }, null] },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalSubmissions: { $sum: 1 },
              reviewedSubmissions: {
                $sum: {
                  $cond: [{ $ne: ["$feedbackScore", null] }, 1, 0],
                },
              },
              pendingReviews: {
                $sum: {
                  $cond: [{ $eq: ["$feedbackScore", null] }, 1, 0],
                },
              },
              averageScore: { $avg: "$feedbackScore" },
            },
          },
          {
            $project: {
              _id: 0,
              totalSubmissions: 1,
              reviewedSubmissions: 1,
              pendingReviews: 1,
              averageScore: {
                $cond: [
                  { $eq: ["$averageScore", null] },
                  null,
                  { $round: ["$averageScore", 2] },
                ],
              },
            },
          },
        ],
        weakSubjects: [
          { $match: { feedbackScore: { $ne: null } } },
          {
            $group: {
              _id: "$exam.subject",
              averageScore: { $avg: "$feedbackScore" },
            },
          },
          { $sort: { averageScore: 1 } },
          { $limit: params.weakLimit },
          {
            $project: {
              _id: 0,
              subject: "$_id",
              averageScore: { $round: ["$averageScore", 2] },
            },
          },
        ],
        recentScores: [
          { $match: { feedbackScore: { $ne: null }, feedbackUpdatedAt: { $ne: null } } },
          { $sort: { feedbackUpdatedAt: -1 } },
          { $limit: params.recentLimit },
          {
            $project: {
              _id: 0,
              submissionId: "$submissionIdStr",
              score: "$feedbackScore",
              updatedAt: "$feedbackUpdatedAt",
            },
          },
        ],
      },
    },
  );

  const [result] = await SubmissionModel.aggregate<{
    summary: Array<{
      totalSubmissions: number;
      reviewedSubmissions: number;
      pendingReviews: number;
      averageScore: number | null;
    }>;
    weakSubjects: Array<{ subject: string; averageScore: number }>;
    recentScores: Array<{ submissionId: string; score: number; updatedAt: Date }>;
  }>(pipeline).exec();

  const summary = result?.summary?.[0];

  return {
    totalSubmissions: summary?.totalSubmissions ?? 0,
    reviewedSubmissions: summary?.reviewedSubmissions ?? 0,
    pendingReviews: summary?.pendingReviews ?? 0,
    averageScore: summary?.averageScore ?? null,
    weakSubjects: result?.weakSubjects ?? [],
    recentScores: result?.recentScores ?? [],
  };
}
