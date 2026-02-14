import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
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
        // Color variants
        orange: 'border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200',
        green: 'border-transparent bg-green-100 text-green-700 hover:bg-green-200',
        red: 'border-transparent bg-red-100 text-red-700 hover:bg-red-200',
        yellow: 'border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        blue: 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200',
        purple: 'border-transparent bg-purple-100 text-purple-700 hover:bg-purple-200',
        gray: 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200',
        // Aliases for backward compatibility
        primary: 'border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200',
        success: 'border-transparent bg-green-100 text-green-700 hover:bg-green-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        error: 'border-transparent bg-red-100 text-red-700 hover:bg-red-200',
        info: 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200',
        amber: 'border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

// Job Status Badge Component
export const JobStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: Record<string, string> = {
    CREATED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    IN_PROGRESS: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    PENDING: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
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
    LOW: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[priority] || priorityColors.MEDIUM}`}>
      {priority}
    </span>
  );
};

export { Badge, badgeVariants };
export default Badge;
