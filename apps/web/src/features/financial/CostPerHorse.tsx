import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PageHeader, Card, CardTitle, DataTable, type Column, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { useCostPerHorse } from '@/api/financial';
import { formatCurrency } from '@/lib/utils';
import type { CostPerHorseSummary } from '@nuestable/shared';

export default function CostPerHorse() {
  const { data: summaries = [], isLoading } = useCostPerHorse({});

  // Sort by ROI descending
  const sorted = [...summaries].sort((a, b) => {
    const roiA = a.totalExpensesCents > 0 ? (a.totalRevenueCents - a.totalExpensesCents) / a.totalExpensesCents : 0;
    const roiB = b.totalExpensesCents > 0 ? (b.totalRevenueCents - b.totalExpensesCents) / b.totalExpensesCents : 0;
    return roiB - roiA;
  });

  const chartData = sorted.slice(0, 10).map((s) => ({
    name: s.horseName,
    expenses: s.totalExpensesCents / 100,
    revenue: s.totalRevenueCents / 100,
  }));

  const columns: Column<CostPerHorseSummary>[] = [
    {
      key: 'rank',
      header: '#',
      width: '50px',
      render: (row: CostPerHorseSummary) => {
        const rank = sorted.indexOf(row) + 1;
        return (
          <span className={rank <= 3 ? 'font-bold text-gold-600' : 'text-gray-500'}>
            {rank}
          </span>
        );
      },
    },
    {
      key: 'horse',
      header: 'Horse',
      render: (s) => <span className="font-semibold">{s.horseName}</span>,
    },
    {
      key: 'expenses',
      header: 'Expenses',
      render: (s) => <span className="text-red-600">{formatCurrency(s.totalExpensesCents)}</span>,
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (s) => <span className="text-green-600">{formatCurrency(s.totalRevenueCents)}</span>,
    },
    {
      key: 'net',
      header: 'Net',
      render: (s) => (
        <span className={s.netCents >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {formatCurrency(s.netCents)}
        </span>
      ),
    },
    {
      key: 'roi',
      header: 'ROI',
      render: (s) => {
        const roi = s.totalExpensesCents > 0
          ? ((s.totalRevenueCents - s.totalExpensesCents) / s.totalExpensesCents) * 100
          : 0;
        return (
          <Badge
            color={roi >= 0 ? 'green' : 'red'}
            size="sm"
          >
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </Badge>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cost Per Horse"
        subtitle="Horse ROI leaderboard"
        breadcrumbs={[
          { label: 'Financial', href: '/financial/expenses' },
          { label: 'Cost Per Horse' },
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : sorted.length === 0 ? (
        <EmptyState message="No financial data available" />
      ) : (
        <>
          <Card className="mb-6">
            <CardTitle className="mb-4">Cost vs Earnings</CardTitle>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue" fill="#1B4332" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Leaderboard</CardTitle>
            <DataTable
              columns={columns}
              data={sorted}
              rowKey={(s) => s.horseId}
              emptyMessage="No data"
            />
          </Card>
        </>
      )}
    </div>
  );
}
