import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PageHeader, Card, CardTitle, Select, DataTable, type Column, Badge, Button, Modal, Input } from '@/components/ui';
import { useExpenses, useCreateExpense } from '@/api/financial';
import { useHorses } from '@/api/horses';
import { useAuthStore } from '@/stores/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { ExpenseCategory } from '@nuestable/shared';
import type { Expense } from '@nuestable/shared';
import { useForm } from 'react-hook-form';
import { PlusIcon } from '@heroicons/react/24/outline';

const COLORS = ['#1B4332', '#D4A843', '#2D7A50', '#4AB87F', '#6EC596', '#9AD6B5', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#14B8A6'];

export default function ExpenseTracker() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useExpenses({
    page,
    limit: 20,
    category: (categoryFilter || undefined) as ExpenseCategory | undefined,
  });
  const { data: horsesData } = useHorses({ limit: 100 });
  const createMutation = useCreateExpense();

  const expenses = data?.data ?? [];
  const horses = horsesData?.data ?? [];

  // Aggregate by category for chart
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amountCents;
  });
  const chartData = Object.entries(categoryTotals).map(([cat, amount]) => ({
    name: cat.replace(/_/g, ' '),
    value: amount / 100,
  }));

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { horseId: '', category: ExpenseCategory.TRAINING as string, description: '', amountCents: '', vendorName: '', occurredOn: '', notes: '' },
  });

  const onSubmit = (formData: Record<string, string>) => {
    createMutation.mutate(
      {
        organizationId: user?.organizationId ?? '',
        horseId: formData.horseId || undefined,
        category: formData.category as ExpenseCategory,
        description: formData.description ?? '',
        amountCents: Math.round(parseFloat(formData.amountCents ?? '0') * 100),
        vendorName: formData.vendorName || undefined,
        occurredOn: formData.occurredOn || new Date().toISOString(),
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Expense recorded');
          reset();
          setShowForm(false);
        },
      },
    );
  };

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...Object.values(ExpenseCategory).map((c) => ({ label: c.replace(/_/g, ' '), value: c })),
  ];
  const horseOptions = [
    { label: 'General (no horse)', value: '' },
    ...horses.map((h) => ({ label: h.name, value: h.id })),
  ];

  const columns: Column<Expense>[] = [
    { key: 'date', header: 'Date', render: (e) => <span>{formatDate(e.occurredOn)}</span>, sortable: true },
    {
      key: 'description',
      header: 'Description',
      render: (e) => (
        <div>
          <p className="font-medium">{e.description}</p>
          {e.vendorName && <p className="text-xs text-gray-500">{e.vendorName}</p>}
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (e) => <Badge color="brand" size="sm">{e.category.replace(/_/g, ' ')}</Badge> },
    {
      key: 'horse',
      header: 'Horse',
      render: (e) => {
        const horse = horses.find((h) => h.id === e.horseId);
        return <span>{horse?.name || '--'}</span>;
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (e) => <span className="font-semibold text-red-600">{formatCurrency(e.amountCents)}</span>,
      sortable: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Expense Tracker"
        breadcrumbs={[
          { label: 'Financial', href: '/financial/expenses' },
          { label: 'Expenses' },
        ]}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Add Expense
          </Button>
        }
      />

      {/* Category breakdown chart */}
      {chartData.length > 0 && (
        <Card className="mb-6">
          <CardTitle className="mb-4">Expense Breakdown</CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="mb-4">
        <Select options={categoryOptions} value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="w-48" />
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        loading={isLoading}
        rowKey={(e) => e.id}
        page={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        emptyMessage="No expenses recorded"
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Expense">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Description" {...register('description', { required: true })} />
          <Input label="Amount ($)" type="number" step="0.01" {...register('amountCents', { required: true })} />
          <Select label="Category" options={categoryOptions.slice(1)} {...register('category')} />
          <Select label="Horse" options={horseOptions} {...register('horseId')} />
          <Input label="Vendor" {...register('vendorName')} />
          <Input label="Date" type="date" {...register('occurredOn')} />
          <Input label="Notes" {...register('notes')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
