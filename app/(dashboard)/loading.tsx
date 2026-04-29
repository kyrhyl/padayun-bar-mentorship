function LoadingCard() {
  return <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />;
}

export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-100" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100 lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      </section>
    </main>
  );
}
