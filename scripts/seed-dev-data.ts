import "dotenv/config";

import { connectToDatabase } from "../lib/db/mongodb";
import { ExamModel } from "../models/Exam";
import { MentorAssignmentModel } from "../models/MentorAssignment";
import { QuestionModel } from "../models/Question";
import { SubmissionModel } from "../models/Submission";
import { UserModel } from "../models/User";

async function seedDevData() {
  await connectToDatabase();

  const admin = await UserModel.findOne({ email: "admin@padayun.app" }).lean().exec();
  const mentor = await UserModel.findOne({ email: "mentor@padayun.app" }).lean().exec();
  const mentee = await UserModel.findOne({ email: "mentee@padayun.app" }).lean().exec();

  if (!admin) {
    throw new Error("Admin user not found. Run seed:users first.");
  }

  if (!mentor || !mentee) {
    throw new Error("Mentor or mentee user not found. Run seed:users first.");
  }

  const question = await QuestionModel.findOneAndUpdate(
    {
      subject: "Civil Law",
      topic: "Obligations and Contracts",
    },
    {
      $set: {
        difficulty: "medium",
        tags: ["contracts", "breach", "damages"],
        prompt:
          "A and B entered into a written contract for the sale of 1,000 sacks of rice to be delivered on June 1. A failed to deliver despite demand. As counsel for B, draft a bar-style essay answer discussing the remedies available under Philippine law.",
        createdBy: admin._id.toString(),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  ).exec();

  const exam = await ExamModel.findOneAndUpdate(
    {
      title: "Civil Law Essay Drill 1",
    },
    {
      $set: {
        subject: "Civil Law",
        topic: "Obligations and Contracts",
        questionId: question._id.toString(),
        durationMinutes: 45,
        instructions:
          "Write a concise but complete CLR-structured answer. Focus on legal basis, proper reasoning, and a direct conclusion.",
        isPublished: true,
        createdBy: admin._id.toString(),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  ).exec();

  await MentorAssignmentModel.findOneAndUpdate(
    {
      mentorId: mentor._id.toString(),
      menteeId: mentee._id.toString(),
    },
    {
      $set: {
        isActive: true,
      },
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      returnDocument: "after",
    },
  ).exec();

  await SubmissionModel.findOneAndUpdate(
    {
      userId: mentee._id.toString(),
      examId: exam._id.toString(),
    },
    {
      $set: {
        answer: "",
        isSubmitted: false,
        startedAt: new Date(Date.now() - 30 * 60 * 1000),
        lastSavedAt: null,
        submittedAt: null,
      },
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      returnDocument: "after",
    },
  ).exec();
}

seedDevData()
  .then(() => {
    console.log("Seeded development questions and exam successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed development data.", error);
    process.exit(1);
  });
