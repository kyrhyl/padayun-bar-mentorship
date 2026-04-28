import { Model, Schema, model, models } from "mongoose";

export interface ExamDocument {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  questionId: string;
  durationMinutes: number;
  instructions: string;
  isPublished: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<ExamDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 10,
      max: 240,
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

examSchema.index({ isPublished: 1, createdAt: -1 });

export const ExamModel =
  (models.Exam as Model<ExamDocument> | undefined) ?? model<ExamDocument>("Exam", examSchema);
