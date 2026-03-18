import { Card } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface StableStatsProps {
  totalHorses?: number;
  activeHorses?: number;
  winRate?: number;
  earningsMTD?: number;
  racesThisMonth?: number;
}

export function StableStats({
  totalHorses = 0,
  activeHorses = 0,
  winRate = 0,
  earningsMTD = 0,
  racesThisMonth = 0,
}: StableStatsProps) {
  const stats = [
    { label: 'Total Horses', value: String(totalHorses), subtext: `${activeHorses} active` },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, subtext: `${racesThisMonth} races this month` },
    { label: 'Earnings MTD', value: formatCurrency(earningsMTD), subtext: 'Month to date' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} padding="md">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{stat.subtext}</p>
        </Card>
      ))}
    </div>
  );
}
