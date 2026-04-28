import {
  assignMentorAction,
  runAutoAssignmentBatchAction,
} from "@/app/(dashboard)/admin/assignments/actions";
import { AssignmentBoard } from "@/components/assignments/assignment-board";
import { requireRole } from "@/lib/auth/authorization";
import { getMentorAssignmentAdminDataService } from "@/services/mentor-assignment.service";

interface AdminAssignmentsPageProps {
  searchParams: Promise<{ success?: string; assigned?: string; pending?: string; error?: string }>;
}

function getStatusMessage(params: { success?: string; assigned?: string; pending?: string; error?: string }) {
  if (params.success === "batch_run") {
    const assigned = Number(params.assigned ?? "0");
    const pending = Number(params.pending ?? "0");
    return { text: `Auto-assignment finished: ${assigned} assigned, ${pending} pending.`, tone: "success" as const };
  }

  if (params.success === "assigned") {
    return { text: "Mentee assignment updated.", tone: "success" as const };
  }

  if (params.error === "mentor_unavailable") {
    return { text: "Target mentor is unavailable for this cycle.", tone: "error" as const };
  }

  if (params.error === "assign_failed") {
    return { text: "Failed to update assignment.", tone: "error" as const };
  }

  return null;
}

export default async function AdminAssignmentsPage({ searchParams }: AdminAssignmentsPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const data = await getMentorAssignmentAdminDataService();
  const status = getStatusMessage(params);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Mentor Assignments</h1>
        <p className="text-sm text-slate-600">Assign and reassign mentees while keeping one active mentor per mentee.</p>
        <p className="text-xs text-slate-500">
          Current cycle: <span className="font-medium">{data.cycleId}</span> · Pending mentees: <span className="font-medium">{data.pendingCount}</span>
        </p>
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

      <form action={runAutoAssignmentBatchAction}>
        <button type="submit" className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white">
          Run Auto-Assignment Now
        </button>
      </form>

      <AssignmentBoard
        pendingMentees={data.pendingMentees}
        mentorCards={data.mentorCards}
        unavailableMentorCards={data.unavailableMentorCards}
        onAssign={assignMentorAction}
      />
    </section>
  );
}
