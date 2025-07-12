export const theme = {
  // Primary Colors
  primary: '#4F8EF7', // Calm blue accent
  primaryLight: '#7CA9FF',
  primaryDark: '#1B3C7F',

  // Accent Colors
  accent: '#38B2AC', // Calm green accent
  accentLight: '#81E6D9',
  accentDark: '#285E61',

  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Background Colors
  background: '#F8F9FA', // Off-white
  white: '#FFFFFF',

  // Gray Scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E9ECEF', // Updated for border
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Text Colors
  textPrimary: '#212529', // High contrast, not pure black
  textSecondary: '#495057',
  textTertiary: '#868E96',

  // Border Colors
  border: '#E9ECEF', // Subtle border
  borderLight: '#F3F4F6',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.08)', // Gentle, diffused shadow
  shadowDark: 'rgba(0, 0, 0, 0.16)',
};

// Spacing scale: multiples of 8px for mobile harmony
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius: 11px for all cards/containers
export const borderRadius = {
  sm: 6,
  md: 8,
  card: 11, // Use this for all cards/containers
  lg: 16,
  xl: 20,
  full: 9999,
};

// Typography: Inter font, clear hierarchy, mobile-friendly sizes
export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.3,
    normal: 1.5,
    relaxed: 1.7,
  },
};