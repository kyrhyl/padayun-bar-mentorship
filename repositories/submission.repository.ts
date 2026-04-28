import { connectToDatabase } from "@/lib/db/mongodb";
import { SubmissionModel, type SubmissionDocument } from "@/models/Submission";

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
}): Promise<SubmissionDocument> {
  await connectToDatabase();
  const created = await SubmissionModel.create(data);
  return created.toObject();
}

export async function updateSubmissionAnswer(params: {
  submissionId: string;
  userId: string;
  answer: string;
  savedAt: Date;
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
