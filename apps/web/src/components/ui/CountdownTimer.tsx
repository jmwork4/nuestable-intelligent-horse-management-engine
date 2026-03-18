import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

export interface CountdownTimerProps {
  targetDate: Date | string | null | undefined;
  className?: string;
  expiredLabel?: string;
  showSeconds?: boolean;
  size?: 'sm' | 'md' | 'lg';
  urgentThresholdHours?: number;
}

export function CountdownTimer({
  targetDate,
  className,
  expiredLabel = 'Expired',
  showSeconds = true,
  size = 'md',
  urgentThresholdHours = 2,
}: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired, totalSeconds } = useCountdown(targetDate);

  const isUrgent = !isExpired && totalSeconds < urgentThresholdHours * 3600;
  const isWarning = !isExpired && !isUrgent && totalSeconds < urgentThresholdHours * 3600 * 6;

  if (isExpired) {
    return (
      <span className={cn('font-mono font-semibold text-gray-400', className)}>
        {expiredLabel}
      </span>
    );
  }

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  }[size];

  return (
    <span
      className={cn(
        'font-mono font-semibold tabular-nums',
        textSize,
        isUrgent && 'text-red-600 dark:text-red-400',
        isWarning && 'text-yellow-600 dark:text-yellow-400',
        !isUrgent && !isWarning && 'text-green-600 dark:text-green-400',
        className,
      )}
    >
      {days > 0 && <span>{days}d </span>}
      <span>{String(hours).padStart(2, '0')}:</span>
      <span>{String(minutes).padStart(2, '0')}</span>
      {showSeconds && <span>:{String(seconds).padStart(2, '0')}</span>}
    </span>
  );
}
