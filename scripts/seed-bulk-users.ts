import "dotenv/config";

import bcrypt from "bcryptjs";

import { connectToDatabase } from "../lib/db/mongodb";
import { MentorAssignmentModel } from "../models/MentorAssignment";
import { UserModel } from "../models/User";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

async function seedBulkUsers() {
  await connectToDatabase();

  const passwordHash = await bcrypt.hash("Padayun123!", 12);

  const mentors = Array.from({ length: 10 }, (_, index) => ({
    name: `Test Mentor ${pad(index + 1)}`,
    email: `mentor${pad(index + 1)}@padayun.app`,
    role: "mentor" as const,
    passwordHash,
    assignmentAvailability: "available" as const,
  }));

  const mentees = Array.from({ length: 20 }, (_, index) => ({
    name: `Test Mentee ${pad(index + 1)}`,
    email: `mentee${pad(index + 1)}@padayun.app`,
    role: "mentee" as const,
    passwordHash,
  }));

  for (const mentor of mentors) {
    await UserModel.updateOne({ email: mentor.email }, { $set: mentor }, { upsert: true }).exec();
  }

  for (const mentee of mentees) {
    await UserModel.updateOne({ email: mentee.email }, { $set: mentee }, { upsert: true }).exec();
  }

  const mentorDocs = await UserModel.find({ email: { $in: mentors.map((mentor) => mentor.email) } })
    .lean()
    .exec();
  const menteeDocs = await UserModel.find({ email: { $in: mentees.map((mentee) => mentee.email) } })
    .lean()
    .exec();

  const mentorByEmail = new Map(mentorDocs.map((mentor) => [mentor.email, mentor]));
  const orderedMentors = mentors
    .map((mentor) => mentorByEmail.get(mentor.email))
    .filter((mentor): mentor is NonNullable<typeof mentor> => Boolean(mentor));

  const sortedMentees = [...menteeDocs].sort((a, b) => a.email.localeCompare(b.email));

  let assignmentsUpserted = 0;

  for (let index = 0; index < sortedMentees.length; index += 1) {
    const mentee = sortedMentees[index];
    const mentor = orderedMentors[index % orderedMentors.length];

    if (!mentor) {
      throw new Error("No mentors available for assignment.");
    }

    await MentorAssignmentModel.findOneAndUpdate(
      { menteeId: mentee._id.toString() },
      {
        $set: {
          mentorId: mentor._id.toString(),
          menteeId: mentee._id.toString(),
          isActive: true,
          endedAt: null,
          assignmentSource: "manual",
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        returnDocument: "after",
      },
    ).exec();

    assignmentsUpserted += 1;
  }

  console.log("Seeded bulk users successfully.");
  console.log(`Mentors: ${orderedMentors.length}`);
  console.log(`Mentees: ${sortedMentees.length}`);
  console.log(`Assignments upserted: ${assignmentsUpserted}`);
  console.log("Default password: Padayun123!");
}

seedBulkUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed bulk users.", error);
    process.exit(1);
  });
