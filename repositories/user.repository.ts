import { connectToDatabase } from "@/lib/db/mongodb";
import type { UserRole } from "@/domain/types/auth";
import { UserModel, type UserDocument } from "@/models/User";

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  await connectToDatabase();
  return UserModel.findOne({ email }).lean<UserDocument>().exec();
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  await connectToDatabase();
  return UserModel.findById(id).lean<UserDocument>().exec();
}

export async function listUsersByIds(ids: string[]): Promise<UserDocument[]> {
  await connectToDatabase();

  if (!ids.length) {
    return [];
  }

  return UserModel.find({ _id: { $in: ids } }).lean<UserDocument[]>().exec();
}

export async function listUsersByRole(role: UserRole): Promise<UserDocument[]> {
  await connectToDatabase();
  return UserModel.find({ role }).sort({ name: 1 }).lean<UserDocument[]>().exec();
}

export async function listAvailableMentorsByCycle(cycleId: string): Promise<UserDocument[]> {
  await connectToDatabase();

  return UserModel.find({
    role: "mentor",
    $or: [
      { assignmentAvailability: { $ne: "unavailable" } },
      { unavailableCycleId: { $ne: cycleId } },
    ],
  })
    .sort({ name: 1 })
    .lean<UserDocument[]>()
    .exec();
}

export async function listUsersByRoles(roles: UserRole[]): Promise<UserDocument[]> {
  await connectToDatabase();
  return UserModel.find({ role: { $in: roles } }).sort({ createdAt: -1 }).lean<UserDocument[]>().exec();
}

export async function listRecentUsersByRoles(roles: UserRole[], limit: number): Promise<UserDocument[]> {
  await connectToDatabase();
  return UserModel.find({ role: { $in: roles } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<UserDocument[]>()
    .exec();
}

export async function createUser(input: CreateUserInput): Promise<UserDocument> {
  await connectToDatabase();
  const created = await UserModel.create({
    ...input,
    assignmentAvailability: input.role === "mentor" ? "available" : undefined,
    unavailableCycleId: input.role === "mentor" ? null : undefined,
  });
  return created.toObject() as UserDocument;
}

export async function setMentorAvailabilityByCycle(params: {
  mentorId: string;
  cycleId: string;
  availability: "available" | "unavailable";
}): Promise<void> {
  await connectToDatabase();

  await UserModel.updateOne(
    {
      _id: params.mentorId,
      role: "mentor",
    },
    {
      $set: {
        assignmentAvailability: params.availability,
        unavailableCycleId: params.availability === "unavailable" ? params.cycleId : null,
      },
    },
  ).exec();
}
