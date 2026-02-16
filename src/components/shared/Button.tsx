import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 
  | 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  | 'success' | 'warning';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg font-sans
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      bg-amber-500 text-white
      hover:bg-amber-600
      active:bg-amber-700
      focus:ring-amber-500/40
      shadow-sm
    `,
    secondary: `
      bg-stone-100 text-stone-700
      hover:bg-stone-200
      active:bg-stone-300
      focus:ring-stone-400/30
      border border-stone-200
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600
      active:bg-red-700
      focus:ring-red-500/40
      shadow-sm
    `,
    ghost: `
      bg-transparent text-stone-500
      hover:text-stone-800 hover:bg-stone-100
      active:bg-stone-200
      focus:ring-stone-400/20
    `,
    outline: `
      bg-white text-stone-700
      border border-stone-200
      hover:bg-stone-50 hover:border-stone-300
      active:bg-stone-100
      focus:ring-stone-400/30
    `,
    success: `
      bg-emerald-500 text-white
      hover:bg-emerald-600
      active:bg-emerald-700
      focus:ring-emerald-500/40
      shadow-sm
    `,
    warning: `
      bg-amber-500 text-white
      hover:bg-amber-600
      active:bg-amber-700
      focus:ring-amber-500/40
      shadow-sm
    `
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base'
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
