"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { examSchema } from "@/lib/validators/exam";
import {
  createExamService,
  deleteExamService,
  toggleExamPublishService,
  updateExamService,
} from "@/services/exam.service";

function parseExamForm(formData: FormData) {
  return examSchema.safeParse({
    title: formData.get("title"),
    subject: formData.get("subject"),
    topic: formData.get("topic"),
    questionId: formData.get("questionId"),
    durationMinutes: formData.get("durationMinutes"),
    instructions: formData.get("instructions"),
    isPublished: formData.get("isPublished") === "on",
  });
}

export async function createExamAction(formData: FormData) {
  const session = await requireRole(["admin"]);
  const parsed = parseExamForm(formData);
  if (!parsed.success) {
    redirect("/admin/exams/new?error=invalid_form");
  }

  try {
    await createExamService({ ...parsed.data, createdBy: session.user.id });
  } catch {
    redirect("/admin/exams/new?error=create_failed");
  }

  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

export async function updateExamAction(examId: string, formData: FormData) {
  await requireRole(["admin"]);
  const parsed = parseExamForm(formData);
  if (!parsed.success) {
    redirect(`/admin/exams/${examId}/edit?error=invalid_form`);
  }

  try {
    await updateExamService(examId, parsed.data);
  } catch {
    redirect(`/admin/exams/${examId}/edit?error=update_failed`);
  }

  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

export async function deleteExamAction(examId: string) {
  await requireRole(["admin"]);
  await deleteExamService(examId);
  revalidatePath("/admin/exams");
}

export async function togglePublishExamAction(examId: string, isPublished: boolean) {
  await requireRole(["admin"]);
  await toggleExamPublishService(examId, isPublished);
  revalidatePath("/admin/exams");
  revalidatePath("/mentee");
}
