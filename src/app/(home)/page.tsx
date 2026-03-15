import { Suspense } from "react";
import { RecentCustomers } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { DashboardChart } from "./_components/dashboard-chart";
import { getDashboardChartData } from "./fetch";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  // const { selected_time_frame } = await searchParams; // Unused for now
  
  // Pre-fetch chart data so it's ready for the component
  const chartData = await getDashboardChartData();

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5 items-stretch">
        <Suspense fallback={null}>
          {/* Chart takes wider portion */}
          <div className="col-span-12 xl:col-span-8">
            <DashboardChart data={chartData} />
          </div>
          {/* Recent Customers takes remaining width */}
          <div className="col-span-12 xl:col-span-4 h-full">
            <RecentCustomers />
          </div>
        </Suspense>
      </div>
    </>
  );
}
