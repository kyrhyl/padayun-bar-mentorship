import { Model, Schema, model, models } from "mongoose";

interface SuspiciousEvent {
  type: "tab_switch";
  at: Date;
}

interface SubmissionAnswerItem {
  questionId: string;
  answer: string;
  lastSavedAt: Date | null;
}

export interface SubmissionDocument {
  _id: string;
  userId: string;
  examId: string;
  answer: string;
  resolvedQuestionIds: string[];
  answers: SubmissionAnswerItem[];
  lastSavedAt: Date | null;
  isSubmitted: boolean;
  submittedAt: Date | null;
  startedAt: Date;
  suspiciousEvents: SuspiciousEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const suspiciousEventSchema = new Schema<SuspiciousEvent>(
  {
    type: {
      type: String,
      enum: ["tab_switch"],
      required: true,
    },
    at: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    _id: false,
  },
);

const submissionAnswerSchema = new Schema<SubmissionAnswerItem>(
  {
    questionId: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      default: "",
    },
    lastSavedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const submissionSchema = new Schema<SubmissionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    examId: {
      type: String,
      required: true,
      index: true,
    },
    answer: {
      type: String,
      default: "",
    },
    resolvedQuestionIds: {
      type: [String],
      default: [],
    },
    answers: {
      type: [submissionAnswerSchema],
      default: [],
    },
    lastSavedAt: {
      type: Date,
      default: null,
    },
    isSubmitted: {
      type: Boolean,
      default: false,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    suspiciousEvents: {
      type: [suspiciousEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

submissionSchema.index({ userId: 1, examId: 1 }, { unique: true });
submissionSchema.index({ examId: 1, userId: 1 });

export const SubmissionModel =
  (models.Submission as Model<SubmissionDocument> | undefined) ??
  model<SubmissionDocument>("Submission", submissionSchema);
