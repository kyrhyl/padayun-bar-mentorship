"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { examSchema } from "@/lib/validators/exam";
import {
  createExamService,
  deleteExamService,
  regenerateExamQuestionSetService,
  toggleExamPublishService,
  updateExamService,
} from "@/services/exam.service";

function parseExamForm(formData: FormData) {
  const questionMode = String(formData.get("questionMode") ?? "manual");
  const base = {
    title: formData.get("title"),
    subject: formData.get("subject"),
    topic: formData.get("topic"),
    durationMinutes: formData.get("durationMinutes"),
    instructions: formData.get("instructions"),
    isPublished: formData.get("isPublished") === "on",
  };

  if (questionMode === "random_pool") {
    const rawDifficulties = String(formData.get("poolDifficulties") ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const difficulties = rawDifficulties.filter((item) => ["easy", "medium", "hard"].includes(item));

    return examSchema.safeParse({
      ...base,
      questionMode: "random_pool",
      poolConfig: {
        subject: String(formData.get("poolSubject") ?? "").trim() || undefined,
        topic: String(formData.get("poolTopic") ?? "").trim() || undefined,
        difficulties,
        tags: String(formData.get("poolTags") ?? "")
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
        questionCount: formData.get("poolQuestionCount"),
      },
    });
  }

  return examSchema.safeParse({
    ...base,
    questionMode: "manual",
    questionIds: formData.getAll("questionIds"),
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
  try {
    await deleteExamService(examId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "delete_failed";
    redirect(`/admin/exams?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/exams");
}

export async function togglePublishExamAction(examId: string, isPublished: boolean) {
  await requireRole(["admin"]);
  await toggleExamPublishService(examId, isPublished);
  revalidatePath("/admin/exams");
  revalidatePath("/mentee/exams");
}

export async function regenerateExamQuestionsAction(examId: string, force: boolean) {
  await requireRole(["admin"]);

  try {
    await regenerateExamQuestionSetService(examId, { force });
  } catch (error) {
    const message = error instanceof Error ? error.message : "regeneration_failed";
    const encoded = encodeURIComponent(message);
    redirect(`/admin/exams?error=${encoded}`);
  }

  revalidatePath("/admin/exams");
  redirect("/admin/exams?success=regenerated");
}
