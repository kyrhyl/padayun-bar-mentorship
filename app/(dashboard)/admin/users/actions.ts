"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";
import { adminCreateUserSchema } from "@/lib/validators/user";
import {
  createUserByAdminService,
  setMentorAvailabilityService,
  updateManagedUserByAdminService,
} from "@/services/user-admin.service";

export async function createUserAction(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = adminCreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect("/admin/users?error=invalid_form");
  }

  try {
    await createUserByAdminService(parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message === "Email already exists.") {
      redirect("/admin/users?error=email_exists");
    }

    redirect("/admin/users?error=create_failed");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?success=created");
}

export async function setMentorAvailabilityAction(formData: FormData) {
  await requireRole(["admin"]);

  const mentorId = formData.get("mentorId");
  const isUnavailable = formData.get("isUnavailable") === "on";
  const availability = isUnavailable ? "unavailable" : "available";

  if (typeof mentorId !== "string") {
    redirect("/admin/users?error=invalid_form");
  }

  try {
    await setMentorAvailabilityService({
      mentorId,
      availability,
    });
  } catch {
    redirect("/admin/users?error=create_failed");
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/assignments");
  redirect("/admin/users?success=updated");
}

export async function updateManagedUserAction(formData: FormData) {
  await requireRole(["admin"]);

  const userId = formData.get("userId");
  const name = formData.get("name");
  const newPassword = formData.get("newPassword");

  if (typeof userId !== "string" || typeof name !== "string" || typeof newPassword !== "string") {
    redirect("/admin/users?error=invalid_form");
  }

  try {
    await updateManagedUserByAdminService({
      userId,
      name,
      newPassword,
    });
  } catch {
    redirect("/admin/users?error=update_failed");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?success=user_updated");
}
