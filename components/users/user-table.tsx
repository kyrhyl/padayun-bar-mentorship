import type { UserDocument } from "@/models/User";

interface UserTableProps {
  users: UserDocument[];
  onSetMentorAvailability: (formData: FormData) => void;
}

function getMentorAvailabilityLabel(user: UserDocument): string {
  if (user.role !== "mentor") {
    return "-";
  }

  if (user.assignmentAvailability === "unavailable") {
    return `Unavailable${user.unavailableCycleId ? ` (${user.unavailableCycleId})` : ""}`;
  }

  return "Available";
}

export function UserTable({ users, onSetMentorAvailability }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Availability</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                No mentor or mentee accounts found.
              </td>
            </tr>
            ) : (
              users.map((user) => (
              <tr key={user._id.toString()} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-slate-700">{user.email}</td>
                <td className="px-4 py-3 text-slate-700 capitalize">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs">{user.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-700">{getMentorAvailabilityLabel(user)}</td>
                <td className="px-4 py-3 text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-slate-700">
                  {user.role === "mentor" ? (
                    <form action={onSetMentorAvailability} className="flex items-center gap-2">
                      <input type="hidden" name="mentorId" value={user._id.toString()} />
                      <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          name="isUnavailable"
                          defaultChecked={user.assignmentAvailability === "unavailable"}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        Unavailable
                      </label>
                      <button type="submit" className="rounded border border-slate-300 px-2 py-1 text-xs">
                        Save
                      </button>
                    </form>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
