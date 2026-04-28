import {
  createUserAction,
  setMentorAvailabilityAction,
  updateManagedUserAction,
} from "@/app/(dashboard)/admin/users/actions";
import { UserCreateForm } from "@/components/users/user-create-form";
import { UserTable } from "@/components/users/user-table";
import { requireRole } from "@/lib/auth/authorization";
import { listManagedUsersForAdminService } from "@/services/user-admin.service";

interface AdminUsersPageProps {
  searchParams: Promise<{
    success?: string;
    error?: string;
    query?: string;
    role?: "mentor" | "mentee";
    availability?: "available" | "unavailable";
  }>;
}

function getStatusMessage(status: { success?: string; error?: string }) {
  if (status.success === "created") {
    return { text: "User account created successfully.", tone: "success" as const };
  }

  if (status.success === "updated") {
    return { text: "Mentor availability updated for the current cycle.", tone: "success" as const };
  }

  if (status.success === "user_updated") {
    return { text: "User name and password updated successfully.", tone: "success" as const };
  }

  if (status.error === "invalid_form") {
    return { text: "Please complete the form with valid values.", tone: "error" as const };
  }

  if (status.error === "email_exists") {
    return { text: "An account with that email already exists.", tone: "error" as const };
  }

  if (status.error === "create_failed") {
    return { text: "Failed to create user account.", tone: "error" as const };
  }

  if (status.error === "update_failed") {
    return { text: "Failed to update user account.", tone: "error" as const };
  }

  return null;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const users = await listManagedUsersForAdminService({
    query: params.query,
    role: params.role,
    availability: params.availability,
  });
  const status = getStatusMessage(params);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-600">Create and manage mentor and mentee accounts.</p>
      </div>

      {status ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            status.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.text}
        </p>
      ) : null}

      <form className="ui-card flex flex-wrap items-center gap-2 p-3">
        <input
          name="query"
          defaultValue={params.query ?? ""}
          placeholder="Search name or email"
          className="ui-input h-9 min-w-[220px] flex-1 text-sm"
        />
        <select name="role" defaultValue={params.role ?? ""} className="ui-input h-9 w-[140px] text-sm">
          <option value="">All roles</option>
          <option value="mentor">Mentor</option>
          <option value="mentee">Mentee</option>
        </select>
        <select
          name="availability"
          defaultValue={params.availability ?? ""}
          className="ui-input h-9 w-[170px] text-sm"
        >
          <option value="">All availability</option>
          <option value="available">Mentor available</option>
          <option value="unavailable">Mentor unavailable</option>
        </select>
        <button type="submit" className="ui-btn-primary h-9 px-3 text-sm font-medium whitespace-nowrap">
          Apply
        </button>
      </form>

      <UserCreateForm action={createUserAction} />
      <UserTable
        users={users}
        onSetMentorAvailability={setMentorAvailabilityAction}
        onUpdateManagedUser={updateManagedUserAction}
      />
    </section>
  );
}
