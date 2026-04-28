import { Model, Schema, model, models } from "mongoose";

export interface MentorAssignmentDocument {
  _id: string;
  mentorId: string;
  menteeId: string;
  isActive: boolean;
  startedAt?: Date;
  endedAt?: Date | null;
  assignmentSource?: "manual" | "scheduled_batch" | "availability_reassignment";
  cycleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mentorAssignmentSchema = new Schema<MentorAssignmentDocument>(
  {
    mentorId: {
      type: String,
      required: true,
      index: true,
    },
    menteeId: {
      type: String,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    assignmentSource: {
      type: String,
      enum: ["manual", "scheduled_batch", "availability_reassignment"],
      default: "manual",
    },
    cycleId: {
      type: String,
      default: "2026-Q2",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

mentorAssignmentSchema.index({ mentorId: 1, menteeId: 1 }, { unique: true });
mentorAssignmentSchema.index(
  { menteeId: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  },
);

export const MentorAssignmentModel =
  (models.MentorAssignment as Model<MentorAssignmentDocument> | undefined) ??
  model<MentorAssignmentDocument>("MentorAssignment", mentorAssignmentSchema);
