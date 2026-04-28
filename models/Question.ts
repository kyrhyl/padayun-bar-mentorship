import { Model, Schema, model, models } from "mongoose";

export const QUESTION_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export interface QuestionDocument {
  _id: string;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  prompt: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<QuestionDocument>(
  {
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
    difficulty: {
      type: String,
      enum: QUESTION_DIFFICULTIES,
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
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

questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ tags: 1 });

export const QuestionModel =
  (models.Question as Model<QuestionDocument> | undefined) ??
  model<QuestionDocument>("Question", questionSchema);
