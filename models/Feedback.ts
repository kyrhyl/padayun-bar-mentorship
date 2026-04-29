import { Model, Schema, model, models } from "mongoose";

interface RubricBreakdown {
  correctResponse: number;
  law: number;
  reasoning: number;
  logic: number;
  grammar: number;
}

export interface FeedbackDocument {
  _id: string;
  submissionId: string;
  mentorId: string;
  score: number;
  rubric: RubricBreakdown;
  comments: string;
  createdAt: Date;
  updatedAt: Date;
}

const rubricSchema = new Schema<RubricBreakdown>(
  {
    correctResponse: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    law: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    reasoning: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    logic: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    grammar: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false },
);

const feedbackSchema = new Schema<FeedbackDocument>(
  {
    submissionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mentorId: {
      type: String,
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      index: true,
    },
    rubric: {
      type: rubricSchema,
      required: true,
    },
    comments: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
  },
  {
    timestamps: true,
  },
);

feedbackSchema.index({ mentorId: 1, createdAt: -1 });

export const FeedbackModel =
  (models.Feedback as Model<FeedbackDocument> | undefined) ??
  model<FeedbackDocument>("Feedback", feedbackSchema);
