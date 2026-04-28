import { connectToDatabase } from "@/lib/db/mongodb";
import { FeedbackModel, type FeedbackDocument } from "@/models/Feedback";
import type { PipelineStage } from "mongoose";

export async function upsertFeedback(data: {
  submissionId: string;
  mentorId: string;
  score: number;
  rubric: {
    correctResponse: number;
    law: number;
    reasoning: number;
    logic: number;
    grammar: number;
  };
  comments: string;
}): Promise<FeedbackDocument> {
  await connectToDatabase();

  const feedback = await FeedbackModel.findOneAndUpdate(
    { submissionId: data.submissionId },
    {
      $set: {
        mentorId: data.mentorId,
        score: data.score,
        rubric: data.rubric,
        comments: data.comments,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  )
    .lean<FeedbackDocument>()
    .exec();

  if (!feedback) {
    throw new Error("Unable to save feedback.");
  }

  return feedback;
}

export async function findFeedbackBySubmissionId(
  submissionId: string,
): Promise<FeedbackDocument | null> {
  await connectToDatabase();
  return FeedbackModel.findOne({ submissionId }).lean<FeedbackDocument>().exec();
}

export async function listFeedbackBySubmissionIds(
  submissionIds: string[],
): Promise<FeedbackDocument[]> {
  await connectToDatabase();

  if (!submissionIds.length) {
    return [];
  }

  return FeedbackModel.find({ submissionId: { $in: submissionIds } })
    .lean<FeedbackDocument[]>()
    .exec();
}

export async function listFeedbackByMentorId(params: {
  mentorId: string;
  page: number;
  limit: number;
}): Promise<{ items: FeedbackDocument[]; totalItems: number }> {
  await connectToDatabase();

  const filter = { mentorId: params.mentorId };

  const [items, totalItems] = await Promise.all([
    FeedbackModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean<FeedbackDocument[]>()
      .exec(),
    FeedbackModel.countDocuments(filter).exec(),
  ]);

  return { items, totalItems };
}

export async function listFeedbackByMentorIdAll(mentorId: string): Promise<FeedbackDocument[]> {
  await connectToDatabase();
  return FeedbackModel.find({ mentorId }).sort({ updatedAt: -1 }).lean<FeedbackDocument[]>().exec();
}

export async function listFeedbackByMentorIdFiltered(params: {
  mentorId: string;
  userIds: string[];
  page: number;
  limit: number;
  menteeId?: string;
  subject?: string;
}): Promise<{ items: FeedbackDocument[]; totalItems: number }> {
  await connectToDatabase();

  if (!params.userIds.length) {
    return { items: [], totalItems: 0 };
  }

  const subjectRegex = params.subject ? new RegExp(params.subject, "i") : null;

  const basePipeline: PipelineStage[] = [
    { $match: { mentorId: params.mentorId } },
    {
      $lookup: {
        from: "submissions",
        let: { submissionId: "$submissionId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: [{ $toString: "$_id" }, "$$submissionId"] },
            },
          },
        ],
        as: "submission",
      },
    },
    { $unwind: "$submission" },
    {
      $match: {
        "submission.userId": {
          $in: params.menteeId ? [params.menteeId] : params.userIds,
        },
      },
    },
  ];

  if (subjectRegex) {
    basePipeline.push(
      {
        $lookup: {
          from: "exams",
          let: { examId: "$submission.examId" },
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
    FeedbackModel.aggregate([
      ...basePipeline,
      { $sort: { updatedAt: -1 } },
      { $skip: (params.page - 1) * params.limit },
      { $limit: params.limit },
      { $project: { submission: 0, exam: 0 } },
    ]).exec(),
    FeedbackModel.aggregate<{ totalItems: number }>([
      ...basePipeline,
      { $count: "totalItems" },
    ]).exec(),
  ]);

  return {
    items: items as FeedbackDocument[],
    totalItems: totalResult[0]?.totalItems ?? 0,
  };
}
