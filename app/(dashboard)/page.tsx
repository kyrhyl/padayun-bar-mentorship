import { redirect } from "next/navigation";

import { AdminOpsDashboard } from "@/components/dashboard/admin-ops-dashboard";
import { requireAuth } from "@/lib/auth/authorization";
import { getAdminDashboardService } from "@/services/dashboard.service";

export default async function DashboardPage() {
  const session = await requireAuth();

  if (session.user.role === "admin") {
    const dashboard = await getAdminDashboardService();
    return <AdminOpsDashboard data={dashboard} />;
  }

  if (session.user.role === "mentor") {
    redirect("/mentor");
  }

  redirect("/mentee/dashboard");
}
