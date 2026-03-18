import { useNavigate } from 'react-router-dom';
import { Card, DataTable, type Column, StatusBadge, Badge, Button, EmptyState } from '@/components/ui';
import { useDocuments } from '@/api/documents';
import { formatDate } from '@/lib/utils';
import { PlusIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import type { DocumentListItem } from '@nuestable/shared';

interface DocumentsTabProps {
  horseId: string;
}

export function DocumentsTab({ horseId }: DocumentsTabProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useDocuments({ horseId });

  const docs = data?.data ?? [];

  const columns: Column<DocumentListItem>[] = [
    {
      key: 'title',
      header: 'Document',
      render: (doc) => (
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{doc.title}</p>
          <p className="text-xs text-gray-500">{doc.fileType.toUpperCase()}</p>
        </div>
      ),
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
      render: (doc) => (
        <span className={doc.isExpiringSoon ? 'text-red-600 font-medium' : ''}>
          {formatDate(doc.expiresAt)}
        </span>
      ),
    },
    {
      key: 'uploaded',
      header: 'Uploaded',
      render: (doc) => <span className="text-sm text-gray-500">{formatDate(doc.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          icon={<PlusIcon className="h-4 w-4" />}
          size="sm"
          onClick={() => navigate('/documents/upload')}
        >
          Upload Document
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={docs}
        loading={isLoading}
        rowKey={(doc) => doc.id}
        emptyMessage="No documents for this horse"
      />
    </div>
  );
}
