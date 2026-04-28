import { NextResponse } from "next/server";

import { getAppSession } from "@/lib/auth/session";
import { autosaveSubmissionSchema } from "@/lib/validators/submission";
import { autosaveSubmissionService } from "@/services/submission.service";

export async function PATCH(request: Request) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = autosaveSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid autosave payload" }, { status: 400 });
  }

  try {
    const savedAt = parsed.data.clientSavedAt ? new Date(parsed.data.clientSavedAt) : new Date();

    const submission = await autosaveSubmissionService({
      submissionId: parsed.data.submissionId,
      userId: session.user.id,
      answer: parsed.data.answer,
      questionId: parsed.data.questionId,
      savedAt,
    });

    return NextResponse.json({
      ok: true,
      submission: {
        id: submission._id.toString(),
        lastSavedAt: submission.lastSavedAt,
        isSubmitted: submission.isSubmitted,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Autosave failed.";
    const status = message.includes("locked") ? 409 : message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
