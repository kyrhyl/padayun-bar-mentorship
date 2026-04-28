import { mentorAssignmentSchema } from "@/lib/validators/mentor-assignment";
import {
  listMentorAssignments,
  upsertMentorAssignment,
} from "@/repositories/mentor-assignment.repository";
import {
  listAvailableMentorsByCycle,
  findUserById,
  listUsersByIds,
  listUsersByRole,
} from "@/repositories/user.repository";

function getCurrentCycleId(): string {
  return process.env.CURRENT_CYCLE_ID?.trim() || "2026-Q2";
}

export async function getMentorAssignmentAdminDataService() {
  const cycleId = getCurrentCycleId();
  const [mentors, mentees, assignments] = await Promise.all([
    listUsersByRole("mentor"),
    listUsersByRole("mentee"),
    listMentorAssignments(),
  ]);

  const unavailableMentorIds = new Set(
    mentors
      .filter(
        (mentor) =>
          mentor.assignmentAvailability === "unavailable" &&
          mentor.unavailableCycleId === cycleId,
      )
      .map((mentor) => mentor._id.toString()),
  );

  const activeAssignmentByMenteeId = new Map(assignments.map((item) => [item.menteeId, item]));
  const availableMentors = mentors.filter((mentor) => !unavailableMentorIds.has(mentor._id.toString()));
  const unavailableMentors = mentors.filter((mentor) => unavailableMentorIds.has(mentor._id.toString()));

  const pendingMentees = mentees
    .filter((mentee) => {
      const activeAssignment = activeAssignmentByMenteeId.get(mentee._id.toString());
      if (!activeAssignment) {
        return true;
      }

      return unavailableMentorIds.has(activeAssignment.mentorId);
    })
    .map((mentee) => {
      const assignment = activeAssignmentByMenteeId.get(mentee._id.toString());
      return {
        id: mentee._id.toString(),
        name: mentee.name,
        email: mentee.email,
        reason: assignment ? ("mentor_unavailable" as const) : ("unassigned" as const),
        currentMentorName: assignment ? mentors.find((mentor) => mentor._id.toString() === assignment.mentorId)?.name ?? null : null,
      };
    });

  const userIds = new Set<string>();
  assignments.forEach((item) => {
    userIds.add(item.mentorId);
    userIds.add(item.menteeId);
  });

  const users = await listUsersByIds([...userIds]);
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const mentorCards = availableMentors.map((mentor) => {
    const menteeRows = assignments
      .filter((assignment) => assignment.mentorId === mentor._id.toString())
      .map((assignment) => {
        const mentee = userMap.get(assignment.menteeId);
        return {
          id: assignment.menteeId,
          name: mentee?.name ?? "Unknown mentee",
          email: mentee?.email ?? "Unknown email",
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      id: mentor._id.toString(),
      name: mentor.name,
      email: mentor.email,
      mentees: menteeRows,
      load: menteeRows.length,
    };
  });

  const unavailableMentorCards = unavailableMentors.map((mentor) => {
    const affectedCount = assignments.filter((assignment) => assignment.mentorId === mentor._id.toString()).length;
    return {
      id: mentor._id.toString(),
      name: mentor.name,
      email: mentor.email,
      affectedCount,
    };
  });

  return {
    cycleId,
    mentors: availableMentors,
    unavailableMentors: unavailableMentors,
    mentees,
    pendingCount: pendingMentees.length,
    pendingMentees,
    mentorCards,
    unavailableMentorCards,
    assignments: assignments.map((item) => ({
      mentorId: item.mentorId,
      menteeId: item.menteeId,
      mentorName: userMap.get(item.mentorId)?.name ?? "Unknown mentor",
      menteeName: userMap.get(item.menteeId)?.name ?? "Unknown mentee",
      createdAt: item.createdAt,
    })),
  };
}

export async function assignMentorService(input: Record<string, unknown>) {
  const cycleId = getCurrentCycleId();
  const parsed = mentorAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid mentor assignment payload.");
  }

  const mentor = await findUserById(parsed.data.mentorId);
  if (!mentor || mentor.role !== "mentor") {
    throw new Error("Mentor not found.");
  }

  if (mentor.assignmentAvailability === "unavailable" && mentor.unavailableCycleId === cycleId) {
    throw new Error("Mentor is unavailable for the current cycle.");
  }

  await upsertMentorAssignment({
    ...parsed.data,
    source: "manual",
    cycleId,
  });
}

export async function runAutoAssignmentBatchService(): Promise<{
  assignedCount: number;
  pendingCount: number;
}> {
  const cycleId = getCurrentCycleId();
  const [mentors, mentees, assignments, availableMentors] = await Promise.all([
    listUsersByRole("mentor"),
    listUsersByRole("mentee"),
    listMentorAssignments(),
    listAvailableMentorsByCycle(cycleId),
  ]);

  if (!availableMentors.length) {
    return {
      assignedCount: 0,
      pendingCount: mentees.length,
    };
  }

  const unavailableMentorIds = new Set(
    mentors
      .filter(
        (mentor) =>
          mentor.assignmentAvailability === "unavailable" && mentor.unavailableCycleId === cycleId,
      )
      .map((mentor) => mentor._id.toString()),
  );

  const activeAssignmentByMenteeId = new Map(assignments.map((item) => [item.menteeId, item]));
  const pendingMentees = mentees.filter((mentee) => {
    const activeAssignment = activeAssignmentByMenteeId.get(mentee._id.toString());
    if (!activeAssignment) {
      return true;
    }

    return unavailableMentorIds.has(activeAssignment.mentorId);
  });

  const mentorLoad = new Map<string, number>();
  availableMentors.forEach((mentor) => {
    mentorLoad.set(mentor._id.toString(), 0);
  });

  assignments.forEach((assignment) => {
    if (mentorLoad.has(assignment.mentorId)) {
      mentorLoad.set(assignment.mentorId, (mentorLoad.get(assignment.mentorId) ?? 0) + 1);
    }
  });

  const sortedAvailableMentorIds = availableMentors
    .map((mentor) => mentor._id.toString())
    .sort((a, b) => a.localeCompare(b));

  let assignedCount = 0;

  for (const mentee of pendingMentees) {
    const selectedMentorId = [...sortedAvailableMentorIds].sort((a, b) => {
      const loadDiff = (mentorLoad.get(a) ?? 0) - (mentorLoad.get(b) ?? 0);
      if (loadDiff !== 0) {
        return loadDiff;
      }

      return a.localeCompare(b);
    })[0];

    const currentAssignment = activeAssignmentByMenteeId.get(mentee._id.toString());
    if (currentAssignment?.mentorId === selectedMentorId) {
      continue;
    }

    await upsertMentorAssignment({
      mentorId: selectedMentorId,
      menteeId: mentee._id.toString(),
      source: currentAssignment ? "availability_reassignment" : "scheduled_batch",
      cycleId,
    });

    mentorLoad.set(selectedMentorId, (mentorLoad.get(selectedMentorId) ?? 0) + 1);
    assignedCount += 1;
  }

  const pendingCount = pendingMentees.length - assignedCount;

  return {
    assignedCount,
    pendingCount: Math.max(0, pendingCount),
  };
}
