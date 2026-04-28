import { connectToDatabase } from "@/lib/db/mongodb";
import type { UserRole } from "@/domain/types/auth";
import { UserModel, type UserDocument } from "@/models/User";

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
