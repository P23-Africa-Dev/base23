import AppLayout from "@/layouts/app-layout";
import { ReferralsSkeleton } from "@/components/skeletons/referrals-skeleton";

export default function ReferralsLoading() {
  return (
    <AppLayout isSidebarLoading={true}>
      <div className="relative min-h-screen bg-white dark:bg-gray-900 py-6">
        <ReferralsSkeleton />
      </div>
    </AppLayout>
  );
}
