import { mentorAssignmentSchema } from "@/lib/validators/mentor-assignment";
import {
  deactivateMentorAssignment,
  listMentorAssignments,
  upsertMentorAssignment,
} from "@/repositories/mentor-assignment.repository";
import { listUsersByIds, listUsersByRole } from "@/repositories/user.repository";

export async function getMentorAssignmentAdminDataService() {
  const [mentors, mentees, assignments] = await Promise.all([
    listUsersByRole("mentor"),
    listUsersByRole("mentee"),
    listMentorAssignments(),
  ]);

  const userIds = new Set<string>();
  assignments.forEach((item) => {
    userIds.add(item.mentorId);
    userIds.add(item.menteeId);
  });

  const users = await listUsersByIds([...userIds]);
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return {
    mentors,
    mentees,
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
  const parsed = mentorAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid mentor assignment payload.");
  }

  await upsertMentorAssignment(parsed.data);
}

export async function unassignMentorService(input: Record<string, unknown>) {
  const parsed = mentorAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid mentor assignment payload.");
  }

  await deactivateMentorAssignment(parsed.data);
}
