import "dotenv/config";

import bcrypt from "bcryptjs";

import { connectToDatabase } from "../lib/db/mongodb";
import { UserModel } from "../models/User";

async function seedUsers() {
  await connectToDatabase();

  const passwordHash = await bcrypt.hash("Padayun123!", 12);

  const users = [
    {
      name: "Padayun Admin",
      email: "admin@padayun.app",
      role: "admin",
      passwordHash,
    },
    {
      name: "Padayun Mentor",
      email: "mentor@padayun.app",
      role: "mentor",
      passwordHash,
    },
    {
      name: "Padayun Mentee",
      email: "mentee@padayun.app",
      role: "mentee",
      passwordHash,
    },
  ] as const;

  for (const user of users) {
    await UserModel.updateOne({ email: user.email }, { $set: user }, { upsert: true }).exec();
  }
}

seedUsers()
  .then(() => {
    console.log("Seeded users successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed users.", error);
    process.exit(1);
  });
