import { AppLayoutNew } from "@/components/layout/AppLayoutNew";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopServices } from "@/components/dashboard/TopServices";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <AppLayoutNew>
      <div className="space-y-6">
        {/* Stats Cards */}
        <DashboardStats />

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          {/* Top Services */}
          <TopServices />
        </div>

        {/* Upcoming Appointments */}
        <UpcomingAppointments />
      </div>
    </AppLayoutNew>
  );
}