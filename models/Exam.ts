import { Model, Schema, model, models } from "mongoose";

export interface ExamDocument {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  questionId: string;
  questionMode?: "manual" | "random_pool";
  questionIds?: string[];
  poolConfig?: {
    subject?: string;
    topic?: string;
    difficulties?: Array<"easy" | "medium" | "hard">;
    tags?: string[];
    questionCount: number;
  } | null;
  generatedQuestionIds?: string[];
  poolGeneratedAt?: Date | null;
  poolNeedsRegeneration?: boolean;
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
      required: false,
      default: "",
      index: true,
    },
    questionMode: {
      type: String,
      enum: ["manual", "random_pool"],
      default: "manual",
      index: true,
    },
    questionIds: {
      type: [String],
      default: [],
    },
    poolConfig: {
      type: {
        subject: { type: String, required: false },
        topic: { type: String, required: false },
        difficulties: { type: [String], default: [] },
        tags: { type: [String], default: [] },
        questionCount: { type: Number, min: 1, max: 100, required: true },
      },
      required: false,
      default: null,
      _id: false,
    },
    generatedQuestionIds: {
      type: [String],
      default: [],
    },
    poolGeneratedAt: {
      type: Date,
      default: null,
    },
    poolNeedsRegeneration: {
      type: Boolean,
      default: false,
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
