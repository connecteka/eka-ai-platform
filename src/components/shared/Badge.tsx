import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-amber-100 text-amber-800',
        secondary:
          'border-transparent bg-stone-100 text-stone-700',
        destructive:
          'border-transparent bg-red-50 text-red-700',
        outline: 'text-stone-700 border-stone-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Job Status Badge Component
export const JobStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: Record<string, string> = {
    CREATED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    PENDING: 'bg-stone-100 text-stone-600 border-stone-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.PENDING}`}>
      {status}
    </span>
  );
};

// Priority Badge Component
export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const priorityColors: Record<string, string> = {
    LOW: 'bg-stone-100 text-stone-600 border-stone-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    URGENT: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[priority] || priorityColors.MEDIUM}`}>
      {priority}
    </span>
  );
};

export { Badge, badgeVariants };
