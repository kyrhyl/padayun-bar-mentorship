"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { questionSchema } from "@/lib/validators/question";
import {
  createQuestionService,
  deleteQuestionService,
  updateQuestionService,
} from "@/services/question.service";

function parseTags(rawTags: string) {
  return rawTags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export async function createQuestionAction(formData: FormData) {
  const session = await requireRole(["admin"]);

  const parsed = questionSchema.safeParse({
    subject: formData.get("subject"),
    topic: formData.get("topic"),
    difficulty: formData.get("difficulty"),
    tags: parseTags(String(formData.get("tags") ?? "")),
    prompt: formData.get("prompt"),
  });

  if (!parsed.success) {
    throw new Error("Invalid question form data.");
  }

  await createQuestionService({
    ...parsed.data,
    createdBy: session.user.id,
  });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function updateQuestionAction(questionId: string, formData: FormData) {
  await requireRole(["admin"]);

  const parsed = questionSchema.safeParse({
    subject: formData.get("subject"),
    topic: formData.get("topic"),
    difficulty: formData.get("difficulty"),
    tags: parseTags(String(formData.get("tags") ?? "")),
    prompt: formData.get("prompt"),
  });

  if (!parsed.success) {
    throw new Error("Invalid question form data.");
  }

  await updateQuestionService(questionId, parsed.data);

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function deleteQuestionAction(questionId: string) {
  await requireRole(["admin"]);

  await deleteQuestionService(questionId);
  revalidatePath("/admin/questions");
}
