import "dotenv/config";

import { z } from "zod";

import { connectToDatabase } from "../lib/db/mongodb";
import { QuestionModel } from "../models/Question";
import { UserModel } from "../models/User";
import { BAR_QUESTIONS_SEED } from "./data/bar-questions.seed";

const seedQuestionSchema = z.object({
  subject: z.string().trim().min(3),
  topic: z.string().trim().min(3),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string().trim().min(2)).min(1),
  prompt: z.string().trim().min(80).max(2500),
  sourceTitle: z.string().trim().min(3),
  sourceUrl: z.url(),
});

function normalizeForKey(value: string) {
  return value.trim().toLowerCase();
}

async function seedBarQuestions() {
  await connectToDatabase();

  const admin = await UserModel.findOne({ email: "admin@padayun.app" }).lean().exec();
  if (!admin) {
    throw new Error("Admin user not found. Run seed:users first.");
  }

  const parsed = z.array(seedQuestionSchema).safeParse(BAR_QUESTIONS_SEED);
  if (!parsed.success) {
    throw new Error(`Seed dataset validation failed: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
  }

  let inserted = 0;
  let updated = 0;

  for (const item of parsed.data) {
    const identity = {
      subject: normalizeForKey(item.subject),
      topic: normalizeForKey(item.topic),
      prompt: normalizeForKey(item.prompt),
    };

    const existing = await QuestionModel.findOne(identity).select({ _id: 1 }).lean().exec();

    await QuestionModel.findOneAndUpdate(
      identity,
      {
        $set: {
          subject: item.subject,
          topic: item.topic,
          difficulty: item.difficulty,
          tags: [...item.tags, "bar-type", "internet-derived"],
          prompt: item.prompt,
          createdBy: admin._id.toString(),
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).exec();

    if (existing) {
      updated += 1;
    } else {
      inserted += 1;
    }
  }

  console.log(`Bar questions seed complete. Inserted: ${inserted}, Updated: ${updated}, Total: ${parsed.data.length}`);
}

seedBarQuestions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed bar questions.", error);
    process.exit(1);
  });
