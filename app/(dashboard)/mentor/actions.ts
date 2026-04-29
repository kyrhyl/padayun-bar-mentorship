"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { saveFeedbackService } from "@/services/mentor-review.service";

function parseScoreEntries(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  const raw = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(raw * 4) / 4;
}

export async function saveFeedbackAction(formData: FormData) {
  const session = await requireRole(["mentor", "admin"]);

  const correctResponse = parseScoreEntries(formData, "correctResponse");
  const law = parseScoreEntries(formData, "law");
  const reasoning = parseScoreEntries(formData, "reasoning");
  const logic = parseScoreEntries(formData, "logic");
  const grammar = parseScoreEntries(formData, "grammar");
  const commentsByQuestion = formData
    .getAll("comments")
    .map((value) => String(value).trim());
  const nonEmptyComments = commentsByQuestion
    .map((value, index) => (value ? `Q${index + 1}: ${value}` : null))
    .filter((value): value is string => Boolean(value));
  const comments = nonEmptyComments.length
    ? nonEmptyComments.join("\n\n")
    : "No detailed comments provided.";

  await saveFeedbackService(session.user.id, {
    submissionId: formData.get("submissionId"),
    correctResponse: average(correctResponse),
    law: average(law),
    reasoning: average(reasoning),
    logic: average(logic),
    grammar: average(grammar),
    comments,
  });

  revalidatePath("/mentor");
  revalidatePath("/dashboard");
  redirect("/mentor");
}
