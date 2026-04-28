import { assignMentorAction, unassignMentorAction } from "@/app/(dashboard)/admin/assignments/actions";
import { requireRole } from "@/lib/auth/authorization";
import { getMentorAssignmentAdminDataService } from "@/services/mentor-assignment.service";

export default async function AdminAssignmentsPage() {
  await requireRole(["admin"]);

  const data = await getMentorAssignmentAdminDataService();

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Mentor Assignments</h1>
        <p className="text-sm text-slate-600">Assign mentees to mentors and manage active pairings.</p>
      </div>

      <form action={assignMentorAction} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <select name="mentorId" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Select mentor</option>
          {data.mentors.map((mentor) => (
            <option key={mentor._id.toString()} value={mentor._id.toString()}>
              {mentor.name} ({mentor.email})
            </option>
          ))}
        </select>

        <select name="menteeId" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Select mentee</option>
          {data.mentees.map((mentee) => (
            <option key={mentee._id.toString()} value={mentee._id.toString()}>
              {mentee.name} ({mentee.email})
            </option>
          ))}
        </select>

        <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Assign
        </button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Mentor</th>
              <th className="px-4 py-3">Mentee</th>
              <th className="px-4 py-3">Assigned At</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.assignments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No active assignments.
                </td>
              </tr>
            ) : (
              data.assignments.map((assignment) => (
                <tr key={`${assignment.mentorId}-${assignment.menteeId}`}>
                  <td className="px-4 py-3">{assignment.mentorName}</td>
                  <td className="px-4 py-3">{assignment.menteeName}</td>
                  <td className="px-4 py-3">{new Date(assignment.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <form action={unassignMentorAction}>
                      <input type="hidden" name="mentorId" value={assignment.mentorId} />
                      <input type="hidden" name="menteeId" value={assignment.menteeId} />
                      <button type="submit" className="text-red-700 underline">
                        Unassign
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
