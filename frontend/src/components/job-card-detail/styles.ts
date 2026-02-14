// Design tokens and styles for Job Card Detail components

export const styles = {
  // Colors
  ekaOrange: '#da7756',
  ekaOrangeHover: '#c45f40',
  ekaOrangeLight: '#fdf3f0',
  ekaOrangeSuperLight: '#fffaf8',
  ekaOrangeBorder: 'rgba(218, 119, 86, 0.2)',
  g4gPurple: '#5B2D8E',
  g4gPurpleLight: '#F3EDF8',
  g4gGreen: '#3CB44B',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  success: '#16A34A',
  successLight: '#ECFDF5',
  successBorder: '#BBF7D0',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorBorder: '#FECACA',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',
  info: '#2563EB',
  infoLight: '#EFF6FF',
  infoBorder: '#BFDBFE',
  
  // Shadows
  shadowSm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  shadowOrange: '0 4px 14px rgba(218, 119, 86, 0.25)',
  
  // Typography
  fontPrimary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

export const formatCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};
