import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PageHeader, Button, Select, DataTable, type Column, StatusBadge, Badge } from '@/components/ui';
import { useDocuments } from '@/api/documents';
import { formatDate } from '@/lib/utils';
import { DocumentCategory } from '@nuestable/shared';
import type { DocumentListItem } from '@nuestable/shared';

export default function DocumentRepository() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useDocuments({
    page,
    limit: 20,
    search: search || undefined,
    category: (categoryFilter || undefined) as DocumentCategory | undefined,
  });

  const docs = data?.data ?? [];

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...Object.values(DocumentCategory).map((c) => ({ label: c.replace(/_/g, ' '), value: c })),
  ];

  const columns: Column<DocumentListItem>[] = [
    {
      key: 'title',
      header: 'Document',
      render: (doc) => (
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{doc.title}</p>
          <p className="text-xs text-gray-500">{doc.fileType.toUpperCase()} &middot; {doc.uploadedByName}</p>
        </div>
      ),
    },
    {
      key: 'horse',
      header: 'Horse',
      render: (doc) => <span>{doc.horseName || 'General'}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (doc) => <Badge color="brand" size="sm">{doc.category.replace(/_/g, ' ')}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (doc) => <StatusBadge status={doc.status} type="document" size="sm" />,
    },
    {
      key: 'expires',
      header: 'Expires',
      render: (doc) => {
        if (!doc.expiresAt) return <span className="text-gray-400">--</span>;
        return (
          <span className={doc.isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-700'}>
            {formatDate(doc.expiresAt)}
          </span>
        );
      },
    },
    {
      key: 'uploaded',
      header: 'Uploaded',
      render: (doc) => <span className="text-sm text-gray-500">{formatDate(doc.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={`${data?.total ?? 0} documents`}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => navigate('/documents/upload')}>
            Upload
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 min-h-touch"
          />
        </div>
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="w-48"
        />
      </div>

      <DataTable
        columns={columns}
        data={docs}
        loading={isLoading}
        rowKey={(doc) => doc.id}
        page={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        emptyMessage="No documents found"
      />
    </div>
  );
}
