import { Model, Schema, model, models } from "mongoose";

import { USER_ROLES, type UserRole } from "@/domain/types/auth";

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  assignmentAvailability?: "available" | "unavailable";
  unavailableCycleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    assignmentAvailability: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
      index: true,
    },
    unavailableCycleId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel =
  (models.User as Model<UserDocument> | undefined) ??
  model<UserDocument>("User", userSchema);
