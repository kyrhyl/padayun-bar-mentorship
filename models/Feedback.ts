import { Model, Schema, model, models } from "mongoose";

interface ClrBreakdown {
  conclusion: number;
  law: number;
  reasoning: number;
}

export interface FeedbackDocument {
  _id: string;
  submissionId: string;
  mentorId: string;
  score: number;
  clr: ClrBreakdown;
  comments: string;
  createdAt: Date;
  updatedAt: Date;
}

const clrSchema = new Schema<ClrBreakdown>(
  {
    conclusion: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    law: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reasoning: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
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
      max: 100,
      index: true,
    },
    clr: {
      type: clrSchema,
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
