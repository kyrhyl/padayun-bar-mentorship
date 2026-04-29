import { buildPaginationMeta } from "@/lib/utils/pagination";
import { listPageSchema, mentorReviewFilterSchema } from "@/lib/validators/feedback";
import { perfLog, perfNow } from "@/lib/observability/perf";
import {
  listAssignedMenteeIds,
  listMentorAssignments,
} from "@/repositories/mentor-assignment.repository";
import {
  listFeedbackByMentorIdFiltered,
  listFeedbackBySubmissionIds,
} from "@/repositories/feedback.repository";
import {
  listPendingSubmittedSubmissionsByUserIds,
  listSubmissionsByUserId,
} from "@/repositories/submission.repository";
import { listExamsByIds } from "@/repositories/exam.repository";
import { listQuestions } from "@/repositories/question.repository";
import { listExamsForAdmin } from "@/repositories/exam.repository";
import {
  countUsersByRole,
  listRecentUsersByRoles,
  listUsersByIds,
} from "@/repositories/user.repository";

export async function getMenteeDashboardService(
  menteeId: string,
  input: Record<string, unknown>,
): Promise<{
  recentSubmissions: Awaited<ReturnType<typeof listSubmissionsByUserId>>["items"];
  recentScores: Array<{ submissionId: string; score: number }>;
  weakSubjects: Array<{ subject: string; averageScore: number }>;
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const startedAt = perfNow();
  const parsed = listPageSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid dashboard filters.");
  }

  const submissions = await listSubmissionsByUserId(menteeId, parsed.data);

  if (!submissions.items.length) {
    const result = {
      recentSubmissions: submissions.items,
      recentScores: [],
      weakSubjects: [],
      meta: buildPaginationMeta({
        page: parsed.data.page,
        limit: parsed.data.limit,
        totalItems: submissions.totalItems,
      }),
    };

    perfLog("mentee-dashboard", startedAt, {
      menteeId,
      submissions: 0,
      recentScores: 0,
      weakSubjects: 0,
    });

    return result;
  }

  const feedbackList = await listFeedbackBySubmissionIds(
    submissions.items.map((submission) => submission._id.toString()),
  );
  const feedbackBySubmissionId = new Map(
    feedbackList.map((feedback) => [feedback.submissionId, feedback]),
  );

  const recentScores = submissions.items
    .map((submission) => ({
      feedback: feedbackBySubmissionId.get(submission._id.toString()),
      submission,
    }))
    .filter((entry): entry is { feedback: NonNullable<typeof entry.feedback>; submission: typeof entry.submission } =>
      Boolean(entry.feedback),
    )
    .map((entry) => ({
      submissionId: entry.submission._id.toString(),
      score: entry.feedback.score,
    }));

  const reviewedPairs = submissions.items
    .map((submission) => ({
      submission,
      feedback: feedbackBySubmissionId.get(submission._id.toString()),
    }))
    .filter(
      (
        entry,
      ): entry is {
        submission: (typeof submissions.items)[number];
        feedback: NonNullable<(typeof feedbackList)[number]>;
      } => Boolean(entry.feedback),
    );

  const exams = await listExamsByIds(reviewedPairs.map((entry) => entry.submission.examId));
  const examMap = new Map(exams.map((exam) => [exam._id.toString(), exam]));

  const scoresBySubject = new Map<string, number[]>();
  reviewedPairs.forEach((entry) => {
    const exam = examMap.get(entry.submission.examId);
    const feedback = entry.feedback;
    if (!exam || !feedback) {
      return;
    }

    const list = scoresBySubject.get(exam.subject) ?? [];
    list.push(feedback.score);
    scoresBySubject.set(exam.subject, list);
  });

  const weakSubjects = [...scoresBySubject.entries()]
    .map(([subject, scores]) => ({
      subject,
      averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100,
    }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);

  const result = {
    recentSubmissions: submissions.items,
    recentScores,
    weakSubjects,
    meta: buildPaginationMeta({
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalItems: submissions.totalItems,
    }),
  };

  perfLog("mentee-dashboard", startedAt, {
    menteeId,
    submissions: submissions.items.length,
    recentScores: recentScores.length,
    weakSubjects: weakSubjects.length,
  });

  return result;
}

export async function getMentorDashboardService(
  mentorId: string,
  input: Record<string, unknown>,
): Promise<{
  assignedMentees: Array<{ id: string; name: string; email: string }>;
  pendingReviews: number;
  recentReviewed: Array<{ submissionId: string; score: number; updatedAt: Date }>;
  reviewedMeta: ReturnType<typeof buildPaginationMeta>;
  reviewedFilters: { page: number; limit: number; menteeId?: string; subject?: string };
}> {
  const startedAt = perfNow();
  const parsed = mentorReviewFilterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid dashboard filters.");
  }

  const menteeIds = await listAssignedMenteeIds(mentorId);
  const mentees = await listUsersByIds(menteeIds);

  const [pendingList, reviewed] = await Promise.all([
    listPendingSubmittedSubmissionsByUserIds({
      userIds: menteeIds,
      page: 1,
      limit: 1,
    }),
    listFeedbackByMentorIdFiltered({
      mentorId,
      userIds: menteeIds,
      page: parsed.data.page,
      limit: parsed.data.limit,
      menteeId: parsed.data.menteeId,
      subject: parsed.data.subject,
    }),
  ]);

  const result = {
    assignedMentees: mentees.map((mentee) => ({
      id: mentee._id.toString(),
      name: mentee.name,
      email: mentee.email,
    })),
    pendingReviews: pendingList.totalItems,
    recentReviewed: reviewed.items.map((item) => ({
      submissionId: item.submissionId,
      score: item.score,
      updatedAt: item.updatedAt,
    })),
    reviewedMeta: buildPaginationMeta({
      page: parsed.data.page,
      limit: parsed.data.limit,
      totalItems: reviewed.totalItems,
    }),
    reviewedFilters: {
      page: parsed.data.page,
      limit: parsed.data.limit,
      menteeId: parsed.data.menteeId,
      subject: parsed.data.subject,
    },
  };

  perfLog("mentor-dashboard", startedAt, {
    mentorId,
    assignedMentees: menteeIds.length,
    pendingReviews: result.pendingReviews,
    reviewedItems: result.recentReviewed.length,
    reviewedTotal: result.reviewedMeta.totalItems,
    hasSubjectFilter: Boolean(parsed.data.subject),
    hasMenteeFilter: Boolean(parsed.data.menteeId),
  });

  return result;
}

export async function getAdminDashboardService() {
  const startedAt = perfNow();
  const [questionPage, examPage, mentorCount, menteeCount, assignments, recentUsers] = await Promise.all([
    listQuestions({ page: 1, limit: 5 }),
    listExamsForAdmin({ page: 1, limit: 5 }),
    countUsersByRole("mentor"),
    countUsersByRole("mentee"),
    listMentorAssignments(),
    listRecentUsersByRoles(["mentor", "mentee"], 5),
  ]);

  const assignedMenteeIds = new Set(assignments.map((assignment) => assignment.menteeId));
  const publishedExams = examPage.items.filter((exam) => exam.isPublished).length;
  const draftExams = examPage.totalItems - publishedExams;

  const recentActivity = [
    questionPage.items[0]
      ? {
          id: questionPage.items[0]._id.toString(),
          label: `Question created: ${questionPage.items[0].subject}`,
          href: "/admin/questions",
          timestamp: questionPage.items[0].createdAt,
        }
      : null,
    examPage.items[0]
      ? {
          id: examPage.items[0]._id.toString(),
          label: `Exam created: ${examPage.items[0].title}`,
          href: "/admin/exams",
          timestamp: examPage.items[0].createdAt,
        }
      : null,
    assignments[0]
      ? {
          id: assignments[0]._id.toString(),
          label: "Mentor assignment updated",
          href: "/admin/assignments",
          timestamp: assignments[0].updatedAt,
        }
      : null,
    recentUsers[0]
      ? {
          id: recentUsers[0]._id.toString(),
          label: `User created: ${recentUsers[0].name}`,
          href: "/admin/users",
          timestamp: recentUsers[0].createdAt,
        }
      : null,
  ]
    .filter((event): event is NonNullable<typeof event> => Boolean(event))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 6);

  const result = {
    metrics: {
      questionsTotal: questionPage.totalItems,
      examsTotal: examPage.totalItems,
      publishedExams,
      draftExams,
      mentorCount,
      menteeCount,
      assignedMentees: assignedMenteeIds.size,
      unassignedMentees: Math.max(0, menteeCount - assignedMenteeIds.size),
    },
    recentActivity,
    recentExams: examPage.items,
    recentUsers,
  };

  perfLog("admin-dashboard", startedAt, {
    questionsTotal: result.metrics.questionsTotal,
    examsTotal: result.metrics.examsTotal,
    mentorCount: result.metrics.mentorCount,
    menteeCount: result.metrics.menteeCount,
    recentActivity: result.recentActivity.length,
  });

  return result;
}
