import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="text-sm text-slate-600">
        Your account role does not allow access to this page.
      </p>
      <Link href="/dashboard" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
        Back to dashboard
      </Link>
    </main>
  );
}
