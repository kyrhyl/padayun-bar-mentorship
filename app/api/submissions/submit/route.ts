import { NextResponse } from "next/server";

import { getAppSession } from "@/lib/auth/session";
import { submitSubmissionSchema } from "@/lib/validators/submission";
import { submitSubmissionService } from "@/services/submission.service";

export async function POST(request: Request) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = submitSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submit payload" }, { status: 400 });
  }

  try {
    const submission = await submitSubmissionService({
      submissionId: parsed.data.submissionId,
      userId: session.user.id,
    });

    return NextResponse.json({
      ok: true,
      submission: {
        id: submission._id.toString(),
        isSubmitted: submission.isSubmitted,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submit failed.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
