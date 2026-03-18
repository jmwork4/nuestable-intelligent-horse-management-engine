import { Badge, type BadgeProps } from './Badge';
import type { HorseStatus, RaceStatus, WithdrawalStatus, InvoiceStatus, TaskStatus, InjuryStatus, DocumentStatus } from '@nuestable/shared';

const horseStatusColors: Record<string, BadgeProps['color']> = {
  ACTIVE: 'green',
  RETIRED: 'gray',
  SOLD: 'blue',
  DECEASED: 'gray',
  LAYUP: 'yellow',
  CLAIMED: 'purple',
};

const raceStatusColors: Record<string, BadgeProps['color']> = {
  SCHEDULED: 'blue',
  ENTRIES_OPEN: 'green',
  ENTRIES_CLOSED: 'yellow',
  SCRATCHES_POSTED: 'yellow',
  IN_PROGRESS: 'gold',
  OFFICIAL: 'green',
  CANCELLED: 'red',
};

const withdrawalStatusColors: Record<string, BadgeProps['color']> = {
  CLEAR: 'green',
  IN_WITHDRAWAL: 'red',
  WARNING: 'yellow',
};

const invoiceStatusColors: Record<string, BadgeProps['color']> = {
  DRAFT: 'gray',
  SENT: 'blue',
  PAID: 'green',
  OVERDUE: 'red',
  CANCELLED: 'gray',
  PARTIALLY_PAID: 'yellow',
};

const taskStatusColors: Record<string, BadgeProps['color']> = {
  PENDING: 'gray',
  IN_PROGRESS: 'blue',
  COMPLETED: 'green',
  SKIPPED: 'gray',
  OVERDUE: 'red',
};

const injuryStatusColors: Record<string, BadgeProps['color']> = {
  ACTIVE: 'red',
  RECOVERING: 'yellow',
  RESOLVED: 'green',
};

const documentStatusColors: Record<string, BadgeProps['color']> = {
  PENDING: 'gray',
  PROCESSING: 'blue',
  EXTRACTED: 'yellow',
  VERIFIED: 'green',
  REJECTED: 'red',
  EXPIRED: 'red',
};

type StatusType =
  | HorseStatus
  | RaceStatus
  | WithdrawalStatus
  | InvoiceStatus
  | TaskStatus
  | InjuryStatus
  | DocumentStatus;

interface StatusBadgeProps {
  status: StatusType | string;
  type?: 'horse' | 'race' | 'withdrawal' | 'invoice' | 'task' | 'injury' | 'document' | 'entry';
  size?: BadgeProps['size'];
}

const entryStatusColors: Record<string, BadgeProps['color']> = {
  ENTERED: 'blue',
  CONFIRMED: 'green',
  SCRATCHED: 'red',
  FINISHED: 'green',
  DQ: 'red',
  NOMINATED: 'gray',
};

export function StatusBadge({ status, type, size = 'md' }: StatusBadgeProps) {
  let colorMap: Record<string, BadgeProps['color']>;

  switch (type) {
    case 'horse':
      colorMap = horseStatusColors;
      break;
    case 'race':
      colorMap = raceStatusColors;
      break;
    case 'withdrawal':
      colorMap = withdrawalStatusColors;
      break;
    case 'invoice':
      colorMap = invoiceStatusColors;
      break;
    case 'task':
      colorMap = taskStatusColors;
      break;
    case 'injury':
      colorMap = injuryStatusColors;
      break;
    case 'document':
      colorMap = documentStatusColors;
      break;
    case 'entry':
      colorMap = entryStatusColors;
      break;
    default:
      colorMap = {
        ...horseStatusColors,
        ...raceStatusColors,
        ...withdrawalStatusColors,
        ...invoiceStatusColors,
        ...taskStatusColors,
        ...injuryStatusColors,
        ...documentStatusColors,
      };
  }

  const color = colorMap[status] || 'gray';
  const label = status.replace(/_/g, ' ');

  return (
    <Badge color={color} size={size} dot>
      {label}
    </Badge>
  );
}
