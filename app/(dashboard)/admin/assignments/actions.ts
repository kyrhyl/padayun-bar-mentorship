"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/authorization";
import {
  assignMentorService,
  unassignMentorService,
} from "@/services/mentor-assignment.service";

export async function assignMentorAction(formData: FormData) {
  await requireRole(["admin"]);

  await assignMentorService({
    mentorId: formData.get("mentorId"),
    menteeId: formData.get("menteeId"),
  });

  revalidatePath("/admin/assignments");
  revalidatePath("/mentor");
}

export async function unassignMentorAction(formData: FormData) {
  await requireRole(["admin"]);

  await unassignMentorService({
    mentorId: formData.get("mentorId"),
    menteeId: formData.get("menteeId"),
  });

  revalidatePath("/admin/assignments");
  revalidatePath("/mentor");
}
