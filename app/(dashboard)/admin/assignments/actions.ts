"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import {
  assignMentorService,
  runAutoAssignmentBatchService,
} from "@/services/mentor-assignment.service";

export async function assignMentorAction(formData: FormData) {
  await requireRole(["admin"]);

  try {
    await assignMentorService({
      mentorId: formData.get("mentorId"),
      menteeId: formData.get("menteeId"),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Mentor is unavailable for the current cycle.") {
      redirect("/admin/assignments?error=mentor_unavailable");
    }

    redirect("/admin/assignments?error=assign_failed");
  }

  revalidatePath("/admin/assignments");
  revalidatePath("/mentor");
  redirect("/admin/assignments?success=assigned");
}

export async function runAutoAssignmentBatchAction() {
  await requireRole(["admin"]);

  const result = await runAutoAssignmentBatchService();

  revalidatePath("/admin/assignments");
  revalidatePath("/mentor");
  revalidatePath("/admin/users");

  redirect(`/admin/assignments?success=batch_run&assigned=${result.assignedCount}&pending=${result.pendingCount}`);
}
