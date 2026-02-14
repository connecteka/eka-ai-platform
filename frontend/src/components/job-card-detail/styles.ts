// Design tokens and styles for Job Card Detail components
// FINAL LAUNCH VERSION - Elegant Serif + Warm Cream + Amber Accents

export const styles = {
  // Primary Brand Colors
  ekaOrange: '#F98906',
  ekaOrangeHover: '#E07A00',
  ekaOrangeLight: '#FFF5E6',
  ekaOrangeSuperLight: '#FFFBF5',
  ekaOrangeBorder: '#1A1A1A',
  
  // Background Colors
  bgPrimary: '#FFF5E6',
  bgSecondary: '#FFFBF5',
  bgCard: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#1A1A1A',
  textSecondary: '#2C1A0E',
  textMuted: '#5C4A3D',
  textOnPrimary: '#1A1A1A',
  
  // Border Colors
  borderPrimary: '#1A1A1A',
  borderSecondary: '#2C1A0E',
  borderLight: 'rgba(26, 26, 26, 0.15)',
  
  // Legacy color mappings for compatibility
  g4gPurple: '#5B2D8E',
  g4gPurpleLight: '#F3EDF8',
  g4gGreen: '#3CB44B',
  white: '#FFFFFF',
  gray50: '#FFFBF5',
  gray100: '#FFF5E6',
  gray200: '#E8DDD0',
  gray300: '#D4C4B5',
  gray400: '#9C8B7A',
  gray500: '#5C4A3D',
  gray600: '#3D3029',
  gray700: '#2C1A0E',
  gray800: '#1A1A1A',
  gray900: '#0D0D0D',
  success: '#16A34A',
  successLight: '#ECFDF5',
  successBorder: '#16A34A',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorBorder: '#DC2626',
  warning: '#F98906',
  warningLight: '#FFF5E6',
  warningBorder: '#F98906',
  info: '#2563EB',
  infoLight: '#EFF6FF',
  infoBorder: '#2563EB',
  
  // Shadows
  shadowSm: '0 1px 3px rgba(26, 26, 26, 0.08), 0 1px 2px rgba(26, 26, 26, 0.06)',
  shadowMd: '0 4px 6px -1px rgba(26, 26, 26, 0.08), 0 2px 4px -1px rgba(26, 26, 26, 0.05)',
  shadowLg: '0 10px 15px -3px rgba(26, 26, 26, 0.1), 0 4px 6px -2px rgba(26, 26, 26, 0.05)',
  shadowOrange: '0 4px 14px rgba(249, 137, 6, 0.25)',
  
  // Typography - Elegant Serif
  fontDisplay: "'Playfair Display', Georgia, 'Times New Roman', serif",
  fontPrimary: "'Source Serif 4', Georgia, 'Times New Roman', serif",
  fontMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

export const formatCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};
