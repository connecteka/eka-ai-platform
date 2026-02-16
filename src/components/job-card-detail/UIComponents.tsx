import React, { useState } from 'react';
import { styles } from './styles';

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant: 'orange' | 'purple' | 'success' | 'error' | 'warning' | 'info' | 'gray';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, size = 'md', pulse }) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    orange: { background: styles.ekaOrangeLight, color: styles.ekaOrange, border: `1px solid ${styles.ekaOrangeBorder}` },
    purple: { background: styles.g4gPurpleLight, color: styles.g4gPurple, border: `1px solid rgba(91, 45, 142, 0.2)` },
    success: { background: styles.successLight, color: styles.success, border: `1px solid ${styles.successBorder}` },
    error: { background: styles.errorLight, color: styles.error, border: `1px solid ${styles.errorBorder}` },
    warning: { background: styles.warningLight, color: styles.warning, border: `1px solid ${styles.warningBorder}` },
    info: { background: styles.infoLight, color: styles.info, border: `1px solid ${styles.infoBorder}` },
    gray: { background: styles.gray100, color: styles.gray500, border: `1px solid ${styles.gray200}` },
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: size === 'sm' ? '3px 10px' : '5px 14px',
      borderRadius: '9999px',
      fontSize: size === 'sm' ? '11px' : '12px',
      fontWeight: 600,
      ...variantStyles[variant],
    }}>
      {pulse && (
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          animation: 'pulse-dot 1.5s ease-in-out infinite',
        }} />
      )}
      {children}
    </span>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, hover = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        background: styles.white,
        border: `1px solid ${styles.gray200}`,
        borderRadius: '12px',
        boxShadow: isHovered ? styles.shadowMd : styles.shadowSm,
        padding: '24px',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Button Component
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'outline', size = 'md', icon, onClick, fullWidth, style, disabled 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: isHovered ? styles.ekaOrangeHover : styles.ekaOrange, color: styles.white, border: 'none' },
    secondary: { background: isHovered ? '#4A2375' : styles.g4gPurple, color: styles.white, border: 'none' },
    success: { background: isHovered ? '#15803d' : styles.success, color: styles.white, border: 'none' },
    outline: { background: isHovered ? styles.gray50 : styles.white, color: styles.gray700, border: `1px solid ${styles.gray300}` },
    ghost: { background: isHovered ? styles.gray50 : 'transparent', color: styles.gray500, border: 'none' },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '13px', minHeight: '36px' },
    md: { padding: '8px 16px', fontSize: '14px', minHeight: '40px' },
    lg: { padding: '10px 20px', fontSize: '15px', minHeight: '44px' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '8px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 200ms ease',
        transform: isHovered && !disabled ? 'translateY(-1px)' : 'none',
        boxShadow: isHovered && !disabled ? styles.shadowSm : 'none',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: styles.fontPrimary,
        opacity: disabled ? 0.5 : 1,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
};
