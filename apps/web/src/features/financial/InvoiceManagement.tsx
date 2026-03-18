import { useState } from 'react';
import { PageHeader, Card, DataTable, type Column, StatusBadge, Badge, Button, Modal, Input, Select, EmptyState } from '@/components/ui';
import { useInvoices, useSendInvoice, useMarkInvoicePaid } from '@/api/financial';
import { formatCurrency, formatDate } from '@/lib/utils';
import { InvoiceStatus } from '@nuestable/shared';
import type { Invoice } from '@nuestable/shared';
import { PlusIcon, PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function InvoiceManagement() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInvoices({
    page,
    limit: 20,
    status: (statusFilter || undefined) as InvoiceStatus | undefined,
  });
  const sendMutation = useSendInvoice();
  const markPaidMutation = useMarkInvoicePaid();

  const invoices = data?.data ?? [];

  const statusOptions = [
    { label: 'All Status', value: '' },
    ...Object.values(InvoiceStatus).map((s) => ({ label: s.replace(/_/g, ' '), value: s })),
  ];

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: 'Invoice #',
      render: (inv) => <span className="font-mono font-semibold">{inv.invoiceNumber}</span>,
    },
    {
      key: 'recipient',
      header: 'Recipient',
      render: (inv) => (
        <div>
          <p className="font-medium">{inv.recipientName}</p>
          <p className="text-xs text-gray-500">{inv.recipientEmail}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <StatusBadge status={inv.status} type="invoice" />,
    },
    {
      key: 'issued',
      header: 'Issued',
      render: (inv) => <span>{formatDate(inv.issuedOn)}</span>,
    },
    {
      key: 'due',
      header: 'Due',
      render: (inv) => <span>{formatDate(inv.dueOn)}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      render: (inv) => <span className="font-semibold">{formatCurrency(inv.totalCents)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (inv) => (
        <div className="flex gap-2">
          {inv.status === 'DRAFT' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<PaperAirplaneIcon className="h-4 w-4" />}
              onClick={(e) => {
                e.stopPropagation();
                sendMutation.mutate(inv.id);
              }}
              loading={sendMutation.isPending}
            >
              Send
            </Button>
          )}
          {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
            <Button
              variant="ghost"
              size="sm"
              icon={<CheckIcon className="h-4 w-4" />}
              onClick={(e) => {
                e.stopPropagation();
                markPaidMutation.mutate(inv.id);
              }}
              loading={markPaidMutation.isPending}
            >
              Mark Paid
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        breadcrumbs={[
          { label: 'Financial', href: '/financial/expenses' },
          { label: 'Invoices' },
        ]}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />}>
            Create Invoice
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        {['DRAFT', 'SENT', 'OVERDUE', 'PAID'].map((status) => {
          const count = invoices.filter((i) => i.status === status).length;
          const total = invoices.filter((i) => i.status === status).reduce((sum, i) => sum + i.totalCents, 0);
          return (
            <Card key={status} padding="sm">
              <p className="text-xs font-medium text-gray-500 uppercase">{status}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
              <p className="text-sm text-gray-500">{formatCurrency(total)}</p>
            </Card>
          );
        })}
      </div>

      <div className="mb-4">
        <Select options={statusOptions} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-48" />
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        rowKey={(inv) => inv.id}
        page={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        emptyMessage="No invoices"
      />
    </div>
  );
}
