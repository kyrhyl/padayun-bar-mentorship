import { connectToDatabase } from "@/lib/db/mongodb";
import { FeedbackModel, type FeedbackDocument } from "@/models/Feedback";

export async function upsertFeedback(data: {
  submissionId: string;
  mentorId: string;
  score: number;
  clr: {
    conclusion: number;
    law: number;
    reasoning: number;
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
        clr: data.clr,
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
