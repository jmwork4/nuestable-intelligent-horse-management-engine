import { PageHeader } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import { StableStats } from './widgets/StableStats';
import { UpcomingRaces } from './widgets/UpcomingRaces';
import { ActiveWithdrawals } from './widgets/ActiveWithdrawals';
import { ExpiringDocs } from './widgets/ExpiringDocs';
import { RecentResults } from './widgets/RecentResults';
import { useHorses } from '@/api/horses';
import dayjs from 'dayjs';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: horsesData } = useHorses({ limit: 1 });

  const greeting = getGreeting();

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.firstName || 'there'}`}
        subtitle={dayjs().format('dddd, MMMM D, YYYY')}
      />

      {/* Stats row */}
      <StableStats
        totalHorses={horsesData?.total ?? 0}
        activeHorses={horsesData?.total ?? 0}
        winRate={18.5}
        earningsMTD={245000}
        racesThisMonth={12}
      />

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingRaces />
        <ActiveWithdrawals />
        <ExpiringDocs />
        <RecentResults />
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = dayjs().hour();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
