import { NextResponse } from "next/server";

import { getAppSession } from "@/lib/auth/session";
import { securityEventSchema } from "@/lib/validators/submission";
import { logTabSwitchService } from "@/services/submission.service";

export async function POST(request: Request) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = securityEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid security event payload" }, { status: 400 });
  }

  if (parsed.data.type === "tab_switch") {
    await logTabSwitchService({
      submissionId: parsed.data.submissionId,
      userId: session.user.id,
      at: parsed.data.at ? new Date(parsed.data.at) : new Date(),
    });
  }

  return NextResponse.json({ ok: true });
}
