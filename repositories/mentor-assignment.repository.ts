import { connectToDatabase } from "@/lib/db/mongodb";
import {
  MentorAssignmentModel,
  type MentorAssignmentDocument,
} from "@/models/MentorAssignment";

export async function listAssignedMenteeIds(mentorId: string): Promise<string[]> {
  await connectToDatabase();

  const assignments = await MentorAssignmentModel.find({
    mentorId,
    isActive: true,
  })
    .select({ menteeId: 1 })
    .lean<{ menteeId: string }[]>()
    .exec();

  return assignments.map((assignment) => assignment.menteeId.toString());
}

export async function listMentorAssignments(): Promise<MentorAssignmentDocument[]> {
  await connectToDatabase();
  return MentorAssignmentModel.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean<MentorAssignmentDocument[]>()
    .exec();
}

export async function upsertMentorAssignment(params: {
  mentorId: string;
  menteeId: string;
  source?: "manual" | "scheduled_batch" | "availability_reassignment";
  cycleId?: string;
}): Promise<void> {
  await connectToDatabase();

  await MentorAssignmentModel.updateMany(
    {
      menteeId: params.menteeId,
      isActive: true,
      mentorId: { $ne: params.mentorId },
    },
    {
      $set: {
        isActive: false,
        endedAt: new Date(),
      },
    },
  ).exec();

  await MentorAssignmentModel.updateOne(
    {
      mentorId: params.mentorId,
      menteeId: params.menteeId,
    },
    {
      $set: {
        isActive: true,
        endedAt: null,
        startedAt: new Date(),
        assignmentSource: params.source ?? "manual",
        cycleId: params.cycleId ?? "2026-Q2",
      },
    },
    {
      upsert: true,
    },
  ).exec();
}

export async function deactivateMentorAssignment(params: {
  mentorId: string;
  menteeId: string;
}): Promise<void> {
  await connectToDatabase();
  await MentorAssignmentModel.updateOne(
    {
      mentorId: params.mentorId,
      menteeId: params.menteeId,
    },
    {
      $set: {
        isActive: false,
        endedAt: new Date(),
      },
    },
  ).exec();
}

export async function listActiveAssignmentByMenteeIds(menteeIds: string[]): Promise<MentorAssignmentDocument[]> {
  await connectToDatabase();

  if (!menteeIds.length) {
    return [];
  }

  return MentorAssignmentModel.find({
    menteeId: { $in: menteeIds },
    isActive: true,
  })
    .lean<MentorAssignmentDocument[]>()
    .exec();
}

export async function isMentorAssignedToMentee(params: {
  mentorId: string;
  menteeId: string;
}): Promise<boolean> {
  await connectToDatabase();

  const assignment = await MentorAssignmentModel.findOne({
    mentorId: params.mentorId,
    menteeId: params.menteeId,
    isActive: true,
  })
    .select({ _id: 1 })
    .lean()
    .exec();

  return Boolean(assignment);
}
