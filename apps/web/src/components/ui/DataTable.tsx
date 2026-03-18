import { useState, useCallback } from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { cn, getPaginationRange } from '@/lib/utils';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  // Pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Sorting
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // Selection
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = 'No data found',
  page,
  totalPages,
  onPageChange,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  const [localSortKey, setLocalSortKey] = useState<string | null>(null);
  const [localSortDir, setLocalSortDir] = useState<'asc' | 'desc'>('asc');

  const activeSortKey = sortKey ?? localSortKey;
  const activeSortDir = sortDirection ?? localSortDir;

  const handleSort = useCallback(
    (key: string) => {
      if (onSort) {
        onSort(key);
      } else {
        if (localSortKey === key) {
          setLocalSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
          setLocalSortKey(key);
          setLocalSortDir('asc');
        }
      }
    },
    [onSort, localSortKey],
  );

  const sortedData = !onSort && localSortKey
    ? [...data].sort((a, b) => {
        const col = columns.find((c) => c.key === localSortKey);
        if (!col?.accessor) return 0;
        const aVal = col.accessor(a);
        const bVal = col.accessor(b);
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return localSortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (sortedData.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200',
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && activeSortKey === col.key && (
                      activeSortDir === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {sortedData.map((row, idx) => (
              <tr
                key={rowKey ? rowKey(row) : idx}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50',
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                    {col.render ? col.render(row) : col.accessor ? col.accessor(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {page !== undefined && totalPages !== undefined && totalPages > 1 && onPageChange && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              icon={<ChevronLeftIcon className="h-4 w-4" />}
            >
              Prev
            </Button>
            {getPaginationRange(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              icon={<ChevronRightIcon className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
