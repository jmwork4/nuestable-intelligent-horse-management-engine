import { cn } from '@/lib/utils';

const colorMap = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  gold: 'bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-400',
  brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export interface BadgeProps {
  children: React.ReactNode;
  color?: keyof typeof colorMap;
  size?: keyof typeof sizeMap;
  dot?: boolean;
  className?: string;
}

export function Badge({ children, color = 'gray', size = 'md', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        colorMap[color],
        sizeMap[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            color === 'gray' && 'bg-gray-500',
            color === 'green' && 'bg-green-500',
            color === 'yellow' && 'bg-yellow-500',
            color === 'red' && 'bg-red-500',
            color === 'blue' && 'bg-blue-500',
            color === 'purple' && 'bg-purple-500',
            color === 'gold' && 'bg-gold-500',
            color === 'brand' && 'bg-brand-500',
          )}
        />
      )}
      {children}
    </span>
  );
}
