"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { saveFeedbackService } from "@/services/mentor-review.service";

export async function saveFeedbackAction(formData: FormData) {
  const session = await requireRole(["mentor", "admin"]);

  await saveFeedbackService(session.user.id, {
    submissionId: formData.get("submissionId"),
    conclusion: formData.get("conclusion"),
    law: formData.get("law"),
    reasoning: formData.get("reasoning"),
    comments: formData.get("comments"),
  });

  revalidatePath("/mentor");
  revalidatePath("/dashboard");
  redirect("/mentor");
}
