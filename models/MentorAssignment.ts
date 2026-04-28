import { Model, Schema, model, models } from "mongoose";

export interface MentorAssignmentDocument {
  _id: string;
  mentorId: string;
  menteeId: string;
  isActive: boolean;
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
  },
  {
    timestamps: true,
  },
);

mentorAssignmentSchema.index({ mentorId: 1, menteeId: 1 }, { unique: true });

export const MentorAssignmentModel =
  (models.MentorAssignment as Model<MentorAssignmentDocument> | undefined) ??
  model<MentorAssignmentDocument>("MentorAssignment", mentorAssignmentSchema);
