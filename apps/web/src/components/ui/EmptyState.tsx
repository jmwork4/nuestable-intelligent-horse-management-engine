import { FolderOpenIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
  };
  className?: string;
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-4 text-gray-300 dark:text-gray-600">
        {icon || <FolderOpenIcon className="mx-auto h-12 w-12" />}
      </div>
      {title && (
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {message}
      </p>
      {action && (
        <Button variant={action.variant || 'primary'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
