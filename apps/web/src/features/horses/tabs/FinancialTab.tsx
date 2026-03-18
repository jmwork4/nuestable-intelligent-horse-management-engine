import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardTitle, EmptyState } from '@/components/ui';
import { useExpenses, useRevenues } from '@/api/financial';
import { formatCurrency } from '@/lib/utils';

interface FinancialTabProps {
  horseId: string;
}

export function FinancialTab({ horseId }: FinancialTabProps) {
  const { data: expensesData, isLoading: expLoading } = useExpenses({ horseId });
  const { data: revenues = [], isLoading: revLoading } = useRevenues({ horseId });

  const expenses = expensesData?.data ?? [];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amountCents, 0);
  const roi = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;

  // Group expenses by category
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amountCents;
  });

  const chartData = Object.entries(categoryMap).map(([cat, amount]) => ({
    category: cat.replace(/_/g, ' '),
    amount: amount / 100,
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Total Expenses</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">ROI</p>
          <p className={`mt-1 text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Expense breakdown chart */}
      <Card>
        <CardTitle className="mb-4">Expense Breakdown</CardTitle>
        {chartData.length === 0 ? (
          <EmptyState message="No expense data" />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(val) => `$${val.toLocaleString()}`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#1B4332" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
