import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-500 text-white hover:bg-green-500/80',
        warning:
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80',
        error:
          'border-transparent bg-red-500 text-white hover:bg-red-500/80',
        info:
          'border-transparent bg-blue-500 text-white hover:bg-blue-500/80',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// Job Status Badge Component
interface JobStatusBadgeProps {
  status: string;
}

function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    'In-Progress': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'Completed': 'bg-green-500/20 text-green-500 border-green-500/30',
    'Cancelled': 'bg-red-500/20 text-red-500 border-red-500/30',
    'On-Hold': 'bg-gray-500/20 text-gray-500 border-gray-500/30',
  };
  
  const colorClass = statusColors[status] || statusColors['Pending'];
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
}

// Priority Badge Component
interface PriorityBadgeProps {
  priority: string;
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityColors: Record<string, string> = {
    'Low': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'Medium': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Urgent': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  const colorClass = priorityColors[priority] || priorityColors['Medium'];
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      {priority}
    </span>
  );
}

export { Badge, badgeVariants, JobStatusBadge, PriorityBadge };
