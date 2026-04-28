import Link from "next/link";

interface AdminOpsDashboardProps {
  data: {
    metrics: {
      questionsTotal: number;
      examsTotal: number;
      publishedExams: number;
      draftExams: number;
      mentorCount: number;
      menteeCount: number;
      assignedMentees: number;
      unassignedMentees: number;
    };
    recentActivity: Array<{ id: string; label: string; href: string; timestamp: Date }>;
    recentExams: Array<{ _id: string; title: string; subject: string; isPublished: boolean; updatedAt: Date }>;
    recentUsers: Array<{ _id: string; name: string; email: string; role: string; createdAt: Date }>;
  };
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "blue" | "green" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : tone === "green"
        ? "bg-green-50 text-green-700"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700"
          : "bg-emerald-50 text-emerald-700";

  return (
    <article className="ui-card p-4">
      <div className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${toneClass}`}>
        {label}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </article>
  );
}

export function AdminOpsDashboard({ data }: AdminOpsDashboardProps) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-4">
          <div className="ui-card p-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Overview</h1>
            <p className="mt-0.5 text-sm text-slate-600">Welcome back. Here is what&apos;s happening with Padayun today.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Active Users" value={data.metrics.mentorCount + data.metrics.menteeCount} tone="blue" />
            <MetricCard label="Exams Published" value={data.metrics.publishedExams} tone="green" />
            <MetricCard label="Pending Reviews" value={data.metrics.unassignedMentees} tone="amber" />
            <MetricCard label="Questions" value={data.metrics.questionsTotal} tone="emerald" />
          </div>

          <article className="ui-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-900">Exam Snapshot</h2>
              <Link href="/admin/exams" className="text-sm font-medium text-slate-700 underline">View all</Link>
            </div>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Exam Title</th>
                  <th className="px-4 py-2.5 font-semibold">Category</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentExams.map((exam) => (
                  <tr key={exam._id.toString()} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{exam.title}</td>
                    <td className="px-4 py-2.5 text-slate-700">{exam.subject}</td>
                    <td className="px-4 py-2.5 text-slate-600">{new Date(exam.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${exam.isPublished ? "ui-badge-success" : "ui-badge-warn"}`}>
                        {exam.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="ui-card p-4">
            <h2 className="text-base font-semibold text-slate-900">Recent New Users</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {data.recentUsers.slice(0, 4).map((user) => (
                <div key={user._id.toString()} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </div>
              ))}
            </div>
          </article>
        </main>

        <aside className="space-y-4">
          <article className="ui-card p-4">
            <h2 className="text-base font-semibold text-slate-900">Needs Attention</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <p className="font-medium">Draft exam backlog</p>
                <p className="text-xs">{data.metrics.draftExams} exam drafts need publishing.</p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <p className="font-medium">Pending approvals</p>
                <p className="text-xs">{data.metrics.unassignedMentees} mentees require mentor assignment.</p>
              </div>
            </div>
          </article>

          <article className="ui-card p-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {data.recentActivity.length === 0 ? (
                <li className="text-slate-500">No recent activity.</li>
              ) : (
                data.recentActivity.slice(0, 5).map((event) => (
                  <li key={event.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <Link href={event.href} className="font-medium text-slate-800 hover:underline">{event.label}</Link>
                    <p className="text-xs text-slate-500">{event.timestamp.toLocaleString()}</p>
                  </li>
                ))
              )}
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}
