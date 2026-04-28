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
}): Promise<void> {
  await connectToDatabase();
  await MentorAssignmentModel.updateOne(
    {
      mentorId: params.mentorId,
      menteeId: params.menteeId,
    },
    {
      $set: {
        isActive: true,
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
      },
    },
  ).exec();
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
