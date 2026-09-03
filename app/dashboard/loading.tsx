import AppLayout from "@/layouts/app-layout";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <AppLayout isSidebarLoading={true}>
      <div className="relative min-h-screen bg-[#FAFAFA] dark:bg-gray-900 py-6">
        <DashboardSkeleton />
      </div>
    </AppLayout>
  );
}
