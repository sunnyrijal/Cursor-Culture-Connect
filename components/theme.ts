export const theme = {
  // Primary Colors (Purple)
  primary: "#6366F1", // Vibrant indigo purple
  primaryLight: "#A5B4FC", // Soft lavender tint
  primaryDark: "#4338CA", // Deep royal purple

  // Accent Colors (keeping your calm green accent)
  accent: "#38B2AC",
  accentLight: "#81E6D9",
  accentDark: "#285E61",

  // Status Colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Background Colors
  background: "#F8F9FA",
  white: "#FFFFFF",

  // Gray Scale
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E9ECEF",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Text Colors
  textPrimary: "#212529",
  textSecondary: "#495057",
  textTertiary: "#868E96",

  // Border Colors
  border: "#E9ECEF",
  borderLight: "#F3F4F6",

  // Shadow
  shadow: "rgba(0, 0, 0, 0.08)",
  shadowDark: "rgba(0, 0, 0, 0.16)",
}

// Spacing scale: multiples of 8px for mobile harmony
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const neomorphColors = {
  background: "#F0F3F7",
  lightShadow: "#FFFFFF",
  darkShadow: "#CDD2D8",
  primary: theme.primary || "#6366F1",
}

// Border radius: 11px for all cards/containers
export const borderRadius = {
  sm: 6,
  md: 8,
  card: 11, // Use this for all cards/containers
  lg: 16,
  xl: 20,
  full: 9999,
}

// Typography: Inter font, clear hierarchy, mobile-friendly sizes
export const typography = {
  fontFamily: {
    regular: "Inter-Regular",
    medium: "Inter-Medium",
    semiBold: "Inter-SemiBold",
    bold: "Inter-Bold",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 32,
    "4xl": 36,
    "5xl": 42, // Added larger heading sizes
    "6xl": 48,
  },
  lineHeight: {
    tight: 1.2, // Tightened for better heading readability
    normal: 1.5,
    relaxed: 1.7,
  },
    h1: {
      fontSize: 32,
      fontFamily: "Inter-Bold",
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontFamily: "Inter-Bold",
      lineHeight: 1.2,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 24,
      fontFamily: "Inter-SemiBold",
      lineHeight: 1.3,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 20,
      fontFamily: "Inter-SemiBold",
      lineHeight: 1.3,
    },
    h5: {
      fontSize: 18,
      fontFamily: "Inter-Medium",
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      lineHeight: 1.4,
    },
    body: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      lineHeight: 1.4,
    },
    button: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      lineHeight: 1.2,
      letterSpacing: 0.1,
    },
    buttonSmall: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      lineHeight: 1.2,
      letterSpacing: 0.1,
    },
}
